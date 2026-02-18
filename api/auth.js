const bcrypt = require("bcryptjs");
const { prisma, signToken, verifyToken, authenticate, getPlanLimits, json, error, estimateTokens } = require("../lib/shared");

// ═══════════════════════════════════════════
// SIGNUP RATE LIMIT — IP-based, 5 per hour
// Prevents mass account creation abuse
// ═══════════════════════════════════════════
const signupBuckets = new Map();
function signupRateLimit(ip) {
  var now = Date.now();
  var bucket = signupBuckets.get(ip);
  if (!bucket || now - bucket.start > 3600000) {
    bucket = { start: now, count: 0 };
    signupBuckets.set(ip, bucket);
  }
  bucket.count++;
  if (bucket.count > 5) return false;
  return true;
}

// Clean up old buckets every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(function() {
    var now = Date.now();
    for (var entry of signupBuckets) {
      if (now - entry[1].start > 7200000) signupBuckets.delete(entry[0]);
    }
  }, 600000);
}

// Basic email format check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// ═══════════════════════════════════════════
// OAUTH DEVICE FLOW — RFC 8628
// Used by: npx hyperstack-core login (CLI/VPS)
// ═══════════════════════════════════════════
const deviceCodes = new Map();

// Clean expired device codes every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(function () {
    var now = Date.now();
    for (var entry of deviceCodes) {
      if (now > entry[1].expiresAt) deviceCodes.delete(entry[0]);
    }
  }, 300000);
}

function generateCode(len) {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1 for readability
  var code = "";
  var crypto = require("crypto");
  var bytes = crypto.randomBytes(len);
  for (var i = 0; i < len; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  if (req.method === "OPTIONS") return res.status(200).end(); try {

  // ── POST /api/auth?action=signup ──
  if (req.method === "POST" && req.query.action === "signup") {
    // Rate limit by IP
    var ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
    if (!signupRateLimit(ip)) return error(res, "Too many signups. Try again later.", 429);

    var email = (req.body.email || "").trim().toLowerCase();
    var password = req.body.password || "";
    var name = req.body.name || "";

    if (!email || !password) return error(res, "Email and password required");
    if (!isValidEmail(email)) return error(res, "Invalid email format");
    if (password.length < 8) return error(res, "Password must be 8+ characters");
    if (password.length > 128) return error(res, "Password too long");
    if (name.length > 100) return error(res, "Name too long");

    var exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return error(res, "Email already registered");

    var passwordHash = await bcrypt.hash(password, 12);
    var user = await prisma.user.create({
      data: { email, passwordHash, name: name || email.split("@")[0] },
    });

    // Create default workspace
    var workspace = await prisma.workspace.create({
      data: { name: "default", slug: "default" },
    });
    await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
    });

    var token = signToken(user.id);
    return json(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, apiKey: user.apiKey },
    }, 201);
  }

  // ── POST /api/auth?action=login ──
  if (req.method === "POST" && req.query.action === "login") {
    var email2 = (req.body.email || "").trim().toLowerCase();
    var password2 = req.body.password || "";
    if (!email2 || !password2) return error(res, "Email and password required");

    var user2 = await prisma.user.findUnique({ where: { email: email2 } });
    if (!user2) return error(res, "Invalid credentials", 401);

    var valid = await bcrypt.compare(password2, user2.passwordHash);
    if (!valid) return error(res, "Invalid credentials", 401);

    var token2 = signToken(user2.id);
    return json(res, {
      token: token2,
      user: { id: user2.id, email: user2.email, name: user2.name, plan: user2.plan, apiKey: user2.apiKey },
    });
  }

  // ── POST /api/auth?action=request-reset ──
  if (req.method === "POST" && req.query.action === "request-reset") {
    var email3 = (req.body.email || "").trim().toLowerCase();
    if (!email3) return error(res, "Email required");

    var user3 = await prisma.user.findUnique({ where: { email: email3 } });
    // Always return same message to prevent email enumeration
    if (!user3) return json(res, { message: "If that email exists, a reset link has been sent." });

    // Generate a short-lived reset token (1 hour)
    var crypto = require("crypto");
    var resetToken = crypto.randomBytes(32).toString("hex");
    var resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user3.id },
      data: { resetToken, resetExpires },
    });

    // TODO: Send email with reset link: https://cascadeai.dev/hyperstack?reset=TOKEN
    // For now, token is stored but NOT returned to the client
    // Enable email service (SendGrid, Resend, etc.) to complete this flow

    return json(res, {
      message: "If that email exists, a reset link has been sent.",
    });
  }

  // ── POST /api/auth?action=reset-password ──
  if (req.method === "POST" && req.query.action === "reset-password") {
    var resetTok = req.body.token || "";
    var newPass = req.body.password || "";
    if (!resetTok || !newPass) return error(res, "Token and new password required");
    if (newPass.length < 8) return error(res, "Password must be 8+ characters");
    if (newPass.length > 128) return error(res, "Password too long");

    var user4 = await prisma.user.findFirst({
      where: { resetToken: resetTok, resetExpires: { gt: new Date() } },
    });
    if (!user4) return error(res, "Invalid or expired reset token", 401);

    var passwordHash4 = await bcrypt.hash(newPass, 12);
    await prisma.user.update({
      where: { id: user4.id },
      data: { passwordHash: passwordHash4, resetToken: null, resetExpires: null },
    });

    var authToken = signToken(user4.id);
    return json(res, {
      message: "Password reset successful",
      token: authToken,
      user: { id: user4.id, email: user4.email, name: user4.name, plan: user4.plan, apiKey: user4.apiKey },
    });
  }

  // ── POST /api/auth?action=change-password ──
  if (req.method === "POST" && req.query.action === "change-password") {
    var user5 = await authenticate(req);
    if (!user5) return error(res, "Unauthorized", 401);

    var currentPassword = req.body.currentPassword || "";
    var newPassword = req.body.newPassword || "";
    if (!currentPassword || !newPassword) return error(res, "Current and new password required");
    if (newPassword.length < 8) return error(res, "New password must be 8+ characters");
    if (newPassword.length > 128) return error(res, "Password too long");

    var valid5 = await bcrypt.compare(currentPassword, user5.passwordHash);
    if (!valid5) return error(res, "Current password is incorrect", 401);

    var passwordHash5 = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user5.id },
      data: { passwordHash: passwordHash5 },
    });

    return json(res, { message: "Password changed successfully" });
  }

  // ── GET /api/auth (get current user + API key) ──
  if (req.method === "GET") {
    var user6 = await authenticate(req);
    if (!user6) return error(res, "Unauthorized", 401);

    var workspaces = await prisma.workspaceMember.findMany({
      where: { userId: user6.id },
      include: { workspace: { include: { _count: { select: { cards: true } } } } },
    });

    return json(res, {
      user: { id: user6.id, email: user6.email, name: user6.name, plan: user6.plan, apiKey: user6.apiKey },
      workspaces: workspaces.map(function(wm) {
        return {
          id: wm.workspace.id,
          name: wm.workspace.name,
          slug: wm.workspace.slug,
          role: wm.role,
          cardCount: wm.workspace._count.cards,
        };
      }),
    });
  }

  // ── POST /api/auth?action=device-code ──
  // CLI calls this to start the OAuth device flow.
  // Returns a user_code to display + device_code to poll with.
  if (req.method === "POST" && req.query.action === "device-code") {
    var crypto = require("crypto");
    var deviceCode = crypto.randomBytes(32).toString("hex");
    var userCode = generateCode(4) + "-" + generateCode(4); // e.g. "ABCD-EF23"

    deviceCodes.set(deviceCode, {
      userCode: userCode,
      status: "pending", // pending | approved | denied
      userId: null,
      apiKey: null,
      expiresAt: Date.now() + 600000, // 10 minutes
      createdAt: Date.now(),
    });

    // Also index by user_code for the approval page lookup
    deviceCodes.set("uc:" + userCode, deviceCode);

    return json(res, {
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: "https://cascadeai.dev/hyperstack/device",
      verification_uri_complete: "https://cascadeai.dev/hyperstack/device?code=" + userCode,
      expires_in: 600,
      interval: 5,
    });
  }

  // ── POST /api/auth?action=device-approve ──
  // Browser calls this after user logs in and enters the user_code.
  // Requires JWT auth (user must be logged in on the website).
  if (req.method === "POST" && req.query.action === "device-approve") {
    var user = await authenticate(req);
    if (!user) return error(res, "Login required to approve device", 401);

    var userCode = (req.body.user_code || "").trim().toUpperCase();
    if (!userCode) return error(res, "user_code required");

    var deviceCode = deviceCodes.get("uc:" + userCode);
    if (!deviceCode) return error(res, "Invalid or expired code", 404);

    var entry = deviceCodes.get(deviceCode);
    if (!entry || Date.now() > entry.expiresAt) {
      return error(res, "Code expired", 410);
    }
    if (entry.status !== "pending") {
      return error(res, "Code already used", 409);
    }

    // Approve: link device to user's API key
    entry.status = "approved";
    entry.userId = user.id;
    entry.apiKey = user.apiKey;

    return json(res, {
      message: "Device approved",
      user_code: userCode,
    });
  }

  // ── POST /api/auth?action=device-deny ──
  // User explicitly denies the device code from the browser.
  if (req.method === "POST" && req.query.action === "device-deny") {
    var user = await authenticate(req);
    if (!user) return error(res, "Login required", 401);

    var userCode = (req.body.user_code || "").trim().toUpperCase();
    var deviceCode = deviceCodes.get("uc:" + userCode);
    if (deviceCode) {
      var entry = deviceCodes.get(deviceCode);
      if (entry) entry.status = "denied";
    }

    return json(res, { message: "Device denied" });
  }

  // ── POST /api/auth?action=device-token ──
  // CLI polls this every 5 seconds until approved/denied/expired.
  // Body: { device_code: "..." }
  if (req.method === "POST" && req.query.action === "device-token") {
    var deviceCode = req.body.device_code || "";
    if (!deviceCode) return error(res, "device_code required");

    var entry = deviceCodes.get(deviceCode);
    if (!entry) return error(res, "expired_token", 410);

    if (Date.now() > entry.expiresAt) {
      deviceCodes.delete(deviceCode);
      return error(res, "expired_token", 410);
    }

    if (entry.status === "denied") {
      deviceCodes.delete(deviceCode);
      deviceCodes.delete("uc:" + entry.userCode);
      return error(res, "access_denied", 403);
    }

    if (entry.status === "pending") {
      return res.status(428).json({ error: "authorization_pending" });
    }

    if (entry.status === "approved") {
      var approvedUser = await prisma.user.findUnique({ where: { id: entry.userId } });
      var workspaces = await prisma.workspaceMember.findMany({
        where: { userId: entry.userId },
        include: { workspace: true },
      });

      // Clean up used codes
      deviceCodes.delete(deviceCode);
      deviceCodes.delete("uc:" + entry.userCode);

      return json(res, {
        api_key: entry.apiKey,
        user: {
          id: approvedUser.id,
          email: approvedUser.email,
          name: approvedUser.name,
          plan: approvedUser.plan,
        },
        workspaces: workspaces.map(function (wm) {
          return { slug: wm.workspace.slug, name: wm.workspace.name, role: wm.role };
        }),
      });
    }

    return error(res, "Unknown state", 500);
  }

  return error(res, "Method not allowed", 405);
  } catch (err) { console.error("Auth error:", err); return res.status(500).json({ error: "Server error" }); }
};
