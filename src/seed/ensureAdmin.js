const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Idempotent: creates the first admin account from env vars if none exists yet.
// Safe to call every server startup.
async function ensureAdmin() {
  const existing = await Admin.findOne();
  if (existing) return existing;

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn('[seed] No admin account exists and ADMIN_PASSWORD is not set — skipping bootstrap. Set it in .env.');
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({ username, passwordHash });
  console.log(`[seed] Bootstrapped admin account "${username}" from ADMIN_USERNAME/ADMIN_PASSWORD.`);
  return admin;
}

module.exports = ensureAdmin;
