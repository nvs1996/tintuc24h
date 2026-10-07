const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('tintuc24h');
    console.log('[db] MONGODB_URI not set — using in-memory MongoDB (data will NOT persist across restarts).');
  }

  await mongoose.connect(uri);
  console.log('[db] connected');
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, disconnectDB };
