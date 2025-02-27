import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.connect().catch(console.error);

// Handle any connection errors
redis.on('error', (err) => console.error('Redis Client Error', err));

export { redis };
