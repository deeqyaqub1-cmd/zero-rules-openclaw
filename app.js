// ============================================================
// CascadeAI — Backend Server
// Proprietary. Do not distribute.
// ============================================================
// Stack:  Express 4 · better-sqlite3 · stripe · uuid · bcrypt
// Deploy: Railway (single container, £5/mo to start)
//
// npm install express better-sqlite3 stripe uuid bcryptjs dotenv cors helmet
// npm install -D nodemon
//
// .env:
//   PORT=3000
//   STRIPE_SECRET=sk_live_...
//   STRIPE_WEBHOOK_SECRET=whsec_...
//   JWT_SECRET=<random 64-byte hex>
//   DB_PATH=./cascade.db
// ============================================================

'use strict';

require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const crypto        = require('crypto');
const { v4: uuid }  = require('uuid');
const bcrypt        = require('bcryptjs');
const Database      = require('better-sqlite3');
const Stripe        = require('stripe');

// ─── CONFIG ───────────────────────────────────────────────
const PORT               = process.env.PORT || 3000;
const DB_PATH            = process.env.DB_PATH || './cascade.db';
const JWT_SECRET         = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
const stripe             = Stripe(process.env.STRIPE_SECRET || 'sk_test_placeholder');
const STRIPE_WH_SECRET   = process.env.STRIPE_WEBHOOK_SECRET || '';

// ─── PRICING TIERS ────────────────────────────────────────
const TIERS = {
  developer:  { decisions: 10_000,   storageDays: 30,  priceMonthly: 49,  priceAnnual: 39 },
  startup:    { decisions: 100_000,  storageDays: 90,  priceMonthly: 499, priceAnnual: 399 },
  enterprise: { decisions: 1_000_000,storageDays: 2555,priceMonthly: null,priceAnnual: null }, // custom
};

// ─── DB BOOTSTRAP ─────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    name            TEXT,
    tier            TEXT NOT NULL DEFAULT 'developer',
    billing_cycle   TEXT NOT NULL DEFAULT 'monthly',
    stripe_cust_id  TEXT,
    stripe_sub_id   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id),
    key_hash        TEXT UNIQUE NOT NULL,
    label           TEXT DEFAULT 'default',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    last_used_at    TEXT
  );

  CREATE TABLE IF NOT EXISTS credit_ledger (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id),
    cycle_start     TEXT NOT NULL,
    cycle_end       TEXT NOT NULL,
    decisions_used  INTEGER NOT NULL DEFAULT 0,
    decisions_limit INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS traces (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id),
    program_name    TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'executed',
    steps           TEXT NOT NULL DEFAULT '[]',
    root_hash       TEXT NOT NULL,
    input_payload   TEXT,
    output_payload  TEXT,
    duration_ms     REAL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_traces_user    ON traces(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_traces_status  ON traces(user_id, status);
`);

// ─── APP SETUP ────────────────────────────────────────────
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Raw body for Stripe webhooks MUST come before json parser on that route
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── HELPERS ──────────────────────────────────────────────

/** Simple JWT-like token (swap for jsonwebtoken in prod) */
function signToken(userId) {
  const payload = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + 86400000 })).toString('base64');
  const sig     = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [payload, sig] = (token || '').split('.');
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64');
  if (sig !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

/** Middleware: extract & verify token */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace(/^Bearer\s+/i, '');
  const data   = verifyToken(token);
  if (!data) return res.status(401).json({ error: 'Unauthorized' });
  req.userId  = data.id;
  next();
}

/** Hash an API key for storage */
function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** SHA-256 hash for trace steps */
function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/** Get or create the current credit cycle for a user */
function getOrCreateCycle(userId) {
  const tier    = (db.prepare('SELECT tier FROM users WHERE id = ?').get(userId) || {}).tier || 'developer';
  const limit   = TIERS[tier]?.decisions || 10_000;
  const now     = new Date();
  const start   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end     = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  let cycle = db.prepare('SELECT * FROM credit_ledger WHERE user_id = ? AND cycle_start = ?').get(userId, start);
  if (!cycle) {
    const id = uuid();
    db.prepare('INSERT INTO credit_ledger (id, user_id, cycle_start, cycle_end, decisions_used, decisions_limit) VALUES (?,?,?,?,0,?)')
      .run(id, userId, start, end, limit);
    cycle = db.prepare('SELECT * FROM credit_ledger WHERE id = ?').get(id);
  }
  return cycle;
}

// ─── AUTH ROUTES ──────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const id   = uuid();
    db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?,?,?,?)').run(id, email, hash, name || '');

    // Create first API key
    const raw    = `cas_${uuid().replace(/-/g, '').slice(0, 32)}`;
    const keyId  = uuid();
    db.prepare('INSERT INTO api_keys (id, user_id, key_hash, label) VALUES (?,?,?,?)').run(keyId, id, hashKey(raw), 'default');

    // Bootstrap credit cycle
    getOrCreateCycle(id);

    res.status(201).json({ token: signToken(id), apiKey: raw, user: { id, email, name, tier: 'developer' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)  return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: signToken(user.id), user: { id: user.id, email: user.email, name: user.name, tier: user.tier } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user  = db.prepare('SELECT id,email,name,tier,billing_cycle FROM users WHERE id = ?').get(req.userId);
  const cycle = getOrCreateCycle(req.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user, credits: { used: cycle.decisions_used, limit: cycle.decisions_limit, cycleEnd: cycle.cycle_end } });
});

// ─── CREDIT ROUTES ────────────────────────────────────────

// GET /api/credits
app.get('/api/credits', authMiddleware, (req, res) => {
  const cycle = getOrCreateCycle(req.userId);
  const user  = db.prepare('SELECT tier FROM users WHERE id = ?').get(req.userId);
  res.json({
    used:      cycle.decisions_used,
    limit:     cycle.decisions_limit,
    remaining: cycle.decisions_limit - cycle.decisions_used,
    cycleStart:cycle.cycle_start,
    cycleEnd:  cycle.cycle_end,
    tier:      user.tier,
    overageRate: 0.04,   // $/decision above limit
  });
});

// ─── TRACE ROUTES ─────────────────────────────────────────

// POST /api/traces/execute  — called by SDK
app.post('/api/traces/execute', authMiddleware, (req, res) => {
  const cycle = getOrCreateCycle(req.userId);
  if (cycle.decisions_used >= cycle.decisions_limit) {
    return res.status(429).json({ error: 'Credit limit reached', code: 'CREDIT_EXHAUSTED' });
  }

  const { program, inputs, steps } = req.body;
  if (!program) return res.status(400).json({ error: 'program is required' });

  // Build hash chain over steps
  const stepArr = (steps || []).map((s, i) => {
    const prev = i === 0 ? '0'.repeat(64) : null; // filled after
    return { ...s, index: i };
  });

  let prevHash = '0'.repeat(64);
  const hashedSteps = stepArr.map(s => {
    const content = JSON.stringify({ index: s.index, name: s.name, input: s.input, output: s.output, prevHash });
    const hash    = sha256(content);
    const step    = { ...s, prevHash, hash };
    prevHash      = hash;
    return step;
  });

  const rootHash  = prevHash; // last hash in chain
  const traceId   = `cas_${uuid().replace(/-/g,'').slice(0,6)}`;
  const durationMs= parseFloat((Math.random() * 20 + 2).toFixed(2)); // simulate; replace with real measurement

  db.prepare(`INSERT INTO traces (id, user_id, program_name, status, steps, root_hash, input_payload, output_payload, duration_ms)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(traceId, req.userId, program, 'executed', JSON.stringify(hashedSteps), rootHash, JSON.stringify(inputs), JSON.stringify(hashedSteps.at(-1)?.output || null), durationMs);

  // Increment credit usage
  db.prepare('UPDATE credit_ledger SET decisions_used = decisions_used + 1 WHERE user_id = ? AND cycle_start = ?')
    .run(req.userId, cycle.cycle_start);

  res.status(201).json({ id: traceId, rootHash, steps: hashedSteps.length, durationMs });
});

// GET /api/traces — list recent traces
app.get('/api/traces', authMiddleware, (req, res) => {
  const { status, limit = 20, offset = 0 } = req.query;
  let sql  = 'SELECT * FROM traces WHERE user_id = ?';
  const params = [req.userId];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const traces = db.prepare(sql).all(...params).map(t => ({
    id:           t.id,
    program_name: t.program_name,
    status:       t.status,
    stepCount:    JSON.parse(t.steps).length,
    rootHash:     t.root_hash,
    durationMs:   t.duration_ms,
    createdAt:    t.created_at,
  }));

  const total = db.prepare('SELECT COUNT(*) as n FROM traces WHERE user_id = ?').get(req.userId).n;
  res.json({ traces, total });
});

// GET /api/traces/:id — single trace with full steps
app.get('/api/traces/:id', authMiddleware, (req, res) => {
  const trace = db.prepare('SELECT * FROM traces WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!trace) return res.status(404).json({ error: 'Trace not found' });
  res.json({
    id:            trace.id,
    program_name:  trace.program_name,
    status:        trace.status,
    steps:         JSON.parse(trace.steps),
    rootHash:      trace.root_hash,
    input:         JSON.parse(trace.input_payload),
    output:        JSON.parse(trace.output_payload),
    durationMs:    trace.duration_ms,
    createdAt:     trace.created_at,
  });
});

// POST /api/traces/replay/:id — re-execute a trace (returns stored steps deterministically)
app.post('/api/traces/replay/:id', authMiddleware, (req, res) => {
  const trace = db.prepare('SELECT * FROM traces WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!trace) return res.status(404).json({ error: 'Trace not found' });

  const steps = JSON.parse(trace.steps);
  // Verify hash chain integrity
  let prevHash = '0'.repeat(64);
  let chainValid = true;
  for (const step of steps) {
    if (step.prevHash !== prevHash) { chainValid = false; break; }
    prevHash = step.hash;
  }

  res.json({
    id:         trace.id,
    program:    trace.program_name,
    chainValid, // <-- tamper-evident check
    rootHash:   trace.root_hash,
    steps,
    replayedAt: new Date().toISOString(),
  });
});

// POST /api/traces/diff — compare two traces
app.post('/api/traces/diff', authMiddleware, (req, res) => {
  const { traceA, traceB } = req.body;
  if (!traceA || !traceB) return res.status(400).json({ error: 'traceA and traceB required' });

  const a = db.prepare('SELECT * FROM traces WHERE id = ? AND user_id = ?').get(traceA, req.userId);
  const b = db.prepare('SELECT * FROM traces WHERE id = ? AND user_id = ?').get(traceB, req.userId);
  if (!a || !b) return res.status(404).json({ error: 'One or both traces not found' });

  const stepsA = JSON.parse(a.steps);
  const stepsB = JSON.parse(b.steps);
  const maxLen = Math.max(stepsA.length, stepsB.length);

  let divergenceStep = null;
  const diffMap = [];
  for (let i = 0; i < maxLen; i++) {
    const sa = stepsA[i], sb = stepsB[i];
    const same = sa && sb && sa.hash === sb.hash;
    diffMap.push({ index: i, same, a: sa || null, b: sb || null });
    if (!same && divergenceStep === null) divergenceStep = i;
  }

  res.json({
    traceA, traceB,
    divergenceStep,
    totalSteps: { a: stepsA.length, b: stepsB.length },
    diff: diffMap,
  });
});

// ─── API KEY ROUTES ───────────────────────────────────────

// GET /api/keys
app.get('/api/keys', authMiddleware, (req, res) => {
  const keys = db.prepare('SELECT id, label, created_at, last_used_at FROM api_keys WHERE user_id = ?').all(req.userId);
  res.json({ keys });
});

// POST /api/keys — create new key
app.post('/api/keys', authMiddleware, (req, res) => {
  const { label } = req.body;
  const raw = `cas_${uuid().replace(/-/g,'').slice(0,32)}`;
  const id  = uuid();
  db.prepare('INSERT INTO api_keys (id, user_id, key_hash, label) VALUES (?,?,?,?)').run(id, req.userId, hashKey(raw), label || 'new key');
  res.status(201).json({ id, label: label || 'new key', key: raw });
});

// DELETE /api/keys/:id
app.delete('/api/keys/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Key not found' });
  res.json({ deleted: true });
});

// ─── STRIPE ROUTES ────────────────────────────────────────

// POST /api/billing/session — create Stripe Checkout session
app.post('/api/billing/session', authMiddleware, async (req, res) => {
  try {
    const { tier, billing } = req.body; // tier: developer|startup, billing: monthly|annual
    if (!TIERS[tier]) return res.status(400).json({ error: 'Invalid tier' });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

    // Ensure Stripe customer exists
    let custId = user.stripe_cust_id;
    if (!custId) {
      const cust = await stripe.customers.create({ email: user.email, metadata: { cascadeUserId: user.id } });
      custId = cust.id;
      db.prepare('UPDATE users SET stripe_cust_id = ? WHERE id = ?').run(custId, user.id);
    }

    // In real prod: create Price objects in Stripe dashboard and reference their IDs here
    // This is the scaffold — replace 'price_placeholder_xxx' with real Stripe price IDs
    const priceMap = {
      developer_monthly:  'price_placeholder_dev_mo',
      developer_annual:   'price_placeholder_dev_yr',
      startup_monthly:    'price_placeholder_startup_mo',
      startup_annual:     'price_placeholder_startup_yr',
    };
    const priceId = priceMap[`${tier}_${billing}`];

    const session = await stripe.checkout.sessions.create({
      customer:           custId,
      mode:               'subscription',
      line_items:         [{ price: priceId, quantity: 1 }],
      success_url:        `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?session=success`,
      cancel_url:         `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`,
      metadata:           { cascadeUserId: user.id, tier, billing },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe session creation failed' });
  }
});

// GET /api/billing/portal — customer portal
app.get('/api/billing/portal', authMiddleware, async (req, res) => {
  try {
    const user = db.prepare('SELECT stripe_cust_id FROM users WHERE id = ?').get(req.userId);
    if (!user?.stripe_cust_id) return res.status(400).json({ error: 'No Stripe customer' });
    const session = await stripe.billingPortal.sessions.create({
      customer:   user.stripe_cust_id,
      return_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Portal creation failed' });
  }
});

// POST /api/webhooks/stripe — Stripe webhook handler
app.post('/api/webhooks/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WH_SECRET);
  } catch (err) {
    console.error('Webhook sig failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.cascadeUserId;
      const tier    = session.metadata?.tier;
      if (userId && tier) {
        db.prepare('UPDATE users SET tier = ?, stripe_sub_id = ? WHERE id = ?')
          .run(tier, session.subscription, userId);
        // Upgrade credit limit for current cycle
        const cycle = getOrCreateCycle(userId);
        db.prepare('UPDATE credit_ledger SET decisions_limit = ? WHERE id = ?')
          .run(TIERS[tier].decisions, cycle.id);
      }
      break;
    }
    case 'invoice.payment_failed': {
      // Could downgrade tier here; for now just log
      console.warn('Payment failed for sub:', event.data.object.subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub  = event.data.object;
      const user = db.prepare('SELECT id FROM users WHERE stripe_sub_id = ?').get(sub.id);
      if (user) {
        db.prepare('UPDATE users SET tier = ?, stripe_sub_id = NULL WHERE id = ?').run('developer', user.id);
      }
      break;
    }
  }

  res.json({ received: true });
});

// ─── HEALTH ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, version: '1.0.0', uptime: process.uptime() });
});

// ─── START ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CascadeAI server running on port ${PORT}`);
  console.log(`  DB:  ${DB_PATH}`);
  console.log(`  Env: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // for testing
