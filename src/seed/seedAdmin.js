require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const ensureAdmin = require('./ensureAdmin');

// CLI entry point — mainly useful against a real, persistent MONGODB_URI.
// (If MONGODB_URI is unset this connects to a throwaway in-memory instance
// that the running server process does not share, so it won't help there;
// the server bootstraps its own admin account on startup in that mode.)
async function main() {
  await connectDB();
  const admin = await ensureAdmin();
  if (admin) console.log(`Admin ready: ${admin.username}`);
  await disconnectDB();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
