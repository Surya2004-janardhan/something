import { createClient } from 'redis';

const redisConfig: any = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  }
};

if (process.env.REDIS_USER) redisConfig.username = process.env.REDIS_USER;
if (process.env.REDIS_PASS) redisConfig.password = process.env.REDIS_PASS;

// Fallback to URL if provided and no separate host is set
const redisUrl = process.env.REDIS_URL;
const finalConfig = (redisUrl && !process.env.REDIS_HOST) ? { url: redisUrl } : redisConfig;

export const redisClient = createClient(finalConfig);

redisClient.on('error', (err) => console.error('[Redis] Client error', err));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('[Redis] Connected to cloud/local');
  }
}
