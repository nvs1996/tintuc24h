require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const ensureAdmin = require('./seed/ensureAdmin');

const PORT = process.env.PORT || 3000;

async function main() {
  await connectDB();
  await ensureAdmin();

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
    console.log(`[server] admin panel: http://localhost:${PORT}/admin/login`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
