import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.connect().catch(console.error);

// Handle any connection errors
redis.on('error', (err) => console.error('Redis Client Error', err));

export { redis };

//////////////////////////
// if redis isn't running, we can still run the app

// import { createClient } from 'redis';

// const redis = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379',
// });

// // Connect with fallback
// redis.connect().catch((err) => {
//   console.warn('Redis connection failed, caching will be disabled:', err);
// });

// // Wrapper function to safely handle Redis operations
// export async function safeGet(key: string) {
//   try {
//     return await redis.get(key);
//   } catch (err) {
//     console.warn('Redis get operation failed:', err);
//     return null;
//   }
// }

// export { redis };
