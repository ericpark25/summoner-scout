import { redis } from './redis';

// types for rate limit information
export type RateLimitInfo = {
  limit: number;
  interval: number;
  count: number;
  resetTime: number;
};

export type RateLimitResponse = {
  isRateLimited: boolean;
  rateLimits: {
    app: RateLimitInfo[];
    method: RateLimitInfo[];
  };
  retryAfter?: number; //ms until the rate limit resets
};

/**
 * Parses rate limit headers from Riot API
 * Format example: "20:1,100:120" means 20 requests per 1 second, 100 per 120 seconds
 */
export function parseRateLimitHeader(
  header: string
): { limit: number; interval: number }[] {
  if (!header) return [];

  return header.split(',').map((limit) => {
    const [requests, seconds] = limit.split(':').map(Number);
    return {
      limit: requests,
      interval: seconds,
    };
  });
}

/**
 * Parses the count header from Riot API
 * Format example: "1:20,13:100" means 1 of 20 requests used, 13 of 100 requests used
 */
export function parseRateLimitCountHeader(
  header: string
): { count: number; limit: number }[] {
  if (!header) return [];

  return header.split(',').map((count) => {
    const [used, total] = count.split(':').map(Number);
    return {
      count: used,
      limit: total,
    };
  });
}

/**
 * Updates rate limit information in Redis based on API response headers
 */
export async function updateRateLimits(
  region: string,
  method: string,
  headers: Record<string, string>
): Promise<void> {
  const now = Date.now();

  // rate limit headers
  const appRateLimit = headers['x-app-rate-limit'];
  const methodRateLimit = headers['x-method-rate-limit'];
  const appRateLimitCount = headers['x-app-rate-limit-count'];
  const methodRateLimitCount = headers['x-method-rate-limit-count'];

  // parse and store app rate limits in redis cache
  if (appRateLimit && appRateLimitCount) {
    const limits = parseRateLimitHeader(appRateLimit);
    const counts = parseRateLimitCountHeader(appRateLimitCount);

    for (let i = 0; i < limits.length; i++) {
      if (counts[i]) {
        const resetTime = now + limits[i].interval * 1000;
        const key = `ratelimit:${region}:app:${limits[i].interval}`;

        // store current count and reset time
        await redis.hSet(key, {
          count: counts[i].count,
          limit: limits[i].limit,
          resetTime,
        });

        // set expiration for this key
        await redis.expire(key, limits[i].interval);
      }
    }
  }

  // parse and store method rate limits in redis cache
  if (methodRateLimit && methodRateLimitCount) {
    const limits = parseRateLimitHeader(methodRateLimit);
    const counts = parseRateLimitCountHeader(methodRateLimitCount);

    for (let i = 0; i < limits.length; i++) {
      if (counts[i]) {
        const resetTime = now + limits[i].interval * 1000;
        const key = `ratelimit:${region}:${method}:${limits[i].interval}`;

        // store current count and reset time
        redis.hSet(key, {
          count: counts[i].count,
          limit: limits[i].limit,
          resetTime,
        });

        //set expiration for this key
        redis.expire(key, limits[i].interval);
      }
    }
  }
}

/**
 * Checks if a request would exceed rate limits
 * Returns information about rate limits and whether the request should be blocked
 */
export async function checkRateLimits(
  region: string,
  method: string
): Promise<RateLimitResponse> {
  const now = Date.now();
  const appKeys = await redis.keys(`ratelimit:${region}:app:*`);
  const methodKeys = await redis.keys(`ratelimit:${region}:${method}:*`);

  const response: RateLimitResponse = {
    isRateLimited: false,
    rateLimits: {
      app: [],
      method: [],
    },
  };

  // helper function for processing rate limit keys
  async function processKeys(keys: string[], isApp: boolean) {
    let maxRetryAfter = 0;

    for (const key of keys) {
      const data = await redis.hGetAll(key);

      if (Object.keys(data).length === 0) continue;

      const count = parseInt(data.count, 10);
      const limit = parseInt(data.limit, 10);
      const resetTime = parseInt(data.resetTime, 10);
      const interval = parseInt(key.split(':').pop() || '0', 10);

      const timeUntilReset = Math.max(0, resetTime - now);

      const limitInfo: RateLimitInfo = {
        count,
        limit,
        interval,
        resetTime,
      };

      if (isApp) {
        response.rateLimits.app.push(limitInfo);
      } else {
        response.rateLimits.method.push(limitInfo);
      }

      // check if we're close to limit (within 95%)
      if (count >= limit * 0.95) {
        response.isRateLimited = true;
        maxRetryAfter = Math.max(maxRetryAfter, timeUntilReset);
      }
    }

    return maxRetryAfter;
  }

  // process app and method keys
  const appRetryAfter = await processKeys(appKeys, true);
  const methodRetryAfter = await processKeys(methodKeys, false);

  // set the retry time to the max of app and method retry times
  if (response.isRateLimited) {
    response.retryAfter = Math.max(appRetryAfter, methodRetryAfter);
  }

  // console.log(`from checkRateLimits: ${response}`);
  return response;
}

/**
 * Records a request to Riot API
 * This is used when we don't have headers (e.g., for pre-flight checks)
 */
export async function recordRequest(
  region: string,
  method: string
): Promise<void> {
  const now = Date.now();

  // default rate limits for if we don't have them yet
  // from riot's response headers
  const defaultAppLimits = [
    { limit: 20, interval: 1 }, // 20 requests per 1 second
    { limit: 100, interval: 120 }, // 100 requests per 120 seconds
  ];

  const defaultMethodLimits = [
    { limit: 2000, interval: 10 }, // 2000 requests per 10 seconds
  ];

  // increment app rate limit counters
  for (const limit of defaultAppLimits) {
    const key = `ratelimit:${region}:app:${limit.interval}`;
    const data = await redis.hGetAll(key);

    if (Object.keys(data).length === 0) {
      // initialize
      await redis.hSet(key, {
        count: 1,
        limit: limit.limit,
        resetTime: now + limit.interval * 1000,
      });
      await redis.expire(key, limit.interval);
    } else {
      // increment existing counter
      await redis.hIncrBy(key, 'count', 1);
    }
  }

  // increment method rate limit counters
  for (const limit of defaultMethodLimits) {
    const key = `ratelimit:${region}:${method}:${limit.interval}`;
    const data = await redis.hGetAll(key);

    if (Object.keys(data).length === 0) {
      // initialize
      await redis.hSet(key, {
        count: 1,
        limit: limit.limit,
        resetTime: now + limit.interval * 1000,
      });
      await redis.expire(key, limit.interval);
    } else {
      await redis.hIncrBy(key, 'count', 1);
    }
  }
}

/**
 * Formats a rate limit message for display to users
 */
export function formatRateLimitMessage(
  rateLimitResponse: RateLimitResponse
): string {
  if (!rateLimitResponse.isRateLimited) {
    return '';
  }

  const retryAfterSeconds = Math.ceil(
    (rateLimitResponse.retryAfter || 0) / 1000
  );

  if (retryAfterSeconds <= 5) {
    return 'Rate limit reached. Please try again in a few seconds.';
  } else if (retryAfterSeconds <= 60) {
    return `Rate limit reached. Please try again in ${retryAfterSeconds} seconds.`;
  } else {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return `Rate limit reached. Please try again in ${minutes} minute${
      minutes > 1 ? 's' : ''
    }.`;
  }
}

/**
 * Creates response headers for rate limits
 */
export function createRateLimitHeaders(
  rateLimitResponse: RateLimitResponse
): HeadersInit {
  const headers: HeadersInit = {};

  if (rateLimitResponse.isRateLimited && rateLimitResponse.retryAfter) {
    headers['Retry-After'] = Math.ceil(
      rateLimitResponse.retryAfter / 1000
    ).toString();
  }

  // Add custom headers for our frontend
  headers['X-RateLimit-Remaining'] = rateLimitResponse.isRateLimited
    ? '0'
    : '1';
  headers['X-RateLimit-Reset'] = rateLimitResponse.retryAfter
    ? new Date(Date.now() + rateLimitResponse.retryAfter).toISOString()
    : new Date().toISOString();

  // console.log(`from createRateLimitHeaders: ${headers}`);
  return headers;
}
