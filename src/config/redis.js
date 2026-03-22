import IoRedis from 'ioredis';

const baseConfig = {
  host: process.env.VALKEY_HOST,
  port: parseInt(process.env.VALKEY_PORT, 10),
  password: process.env.VALKEY_PASSWORD,
};

// 1. Conexión para Workers (BullMQ)
export const WorkerConnection = new IoRedis({
  ...baseConfig,
  maxRetriesPerRequest: null,
});

// 2. Conexión para Caché de Requests
export const CacheConnection = new IoRedis({
  ...baseConfig,
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
});

// 3. Conexión para express-session
export const SessionConnection = new IoRedis({
  ...baseConfig,
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
});
