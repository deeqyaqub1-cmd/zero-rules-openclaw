// /api/skillfence-license.js
// Vercel serverless function — verifies Stripe checkout session and returns a license key
// Environment variables needed: STRIPE_SECRET_KEY

const https = require('https');
const crypto = require('crypto');

// Simple key generation: SF-PRO-<8 hex>-<8 hex>-<8 hex>
function generateKey(sessionId) {
  const hash = crypto.createHash('sha256').update(sessionId + '_skillfence_pro').digest('hex');
  return 'SF-PRO-' + hash.substring(0, 8).toUpperCase() + '-' + hash.substring(8, 16).toUpperCase() + '-' + hash.substring(16, 24).toUpperCase();
}

function stripeRequest(path, secretKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + secretKey,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from Stripe')); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Verify the checkout session with Stripe
    const session = await stripeRequest('/v1/checkout/sessions/' + sessionId, stripeKey);

    if (session.error) {
      return res.status(400).json({ error: 'Invalid session', detail: session.error.message });
    }

    // Check payment status
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed', status: session.payment_status });
    }

    // Generate deterministic license key from session ID
    // Same session always produces same key (idempotent — user can refresh page)
    const licenseKey = generateKey(session.id);

    return res.status(200).json({
      success: true,
      license_key: licenseKey,
      customer_email: session.customer_details?.email || null,
      product: 'SkillFence Pro',
      activated: new Date().toISOString(),
    });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify payment', detail: err.message });
  }
};
