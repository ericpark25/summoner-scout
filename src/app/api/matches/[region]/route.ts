import { NextResponse } from 'next/server';
import axios from 'axios';
import { getRoutingValue } from '@/utils/functions';
import {
  checkRateLimits,
  updateRateLimits,
  recordRequest,
  formatRateLimitMessage,
  createRateLimitHeaders,
  type RateLimitResponse,
} from '@/lib/rate-limiter';
import { redis } from '@/lib/redis';

// cache ttl for match details set to 1 day
const CACHE_TTL = 60 * 60 * 24;

export async function POST(
  request: Request,
  { params }: { params: { region: string } }
) {
  const { region } = await params;
  const routingValue = await getRoutingValue(region);
  const apiKey = process.env.RIOT_API_KEY;

  try {
    // parse request body for match id array
    const { matchIds } = await request.json();

    if (!matchIds || !Array.isArray(matchIds)) {
      return NextResponse.json(
        { error: 'matchIds must be an array' },
        { status: 400 }
      );
    }

    // check rate limits before making requests
    const method = 'match-details';
    const rateLimitCheck = await checkRateLimits(region, method);

    if (rateLimitCheck.isRateLimited) {
      const message = formatRateLimitMessage(rateLimitCheck);
      const headers = createRateLimitHeaders(rateLimitCheck);

      return NextResponse.json(
        {
          success: false,
          message,
          isRateLimited: true,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429, headers }
      );
    }

    // get cached matches
    const matches = [];
    const uncachedMatchIds = [];

    // check which matches are already in cache
    for (const matchId of matchIds) {
      const cacheKey = `match:${region}:${matchId}`;
      const cachedMatch = await redis.get(cacheKey);

      if (cachedMatch) {
        matches.push(JSON.parse(cachedMatch));
      } else {
        uncachedMatchIds.push(matchId);
      }
    }

    //fetch uncached matches
    if (uncachedMatchIds.length > 0) {
      for (let i = 0; i < uncachedMatchIds.length; i++) {
        await recordRequest(region, method); // record request to inc counters
      }

      // for each match id, fetch match details in parallel
      const matchDetailsPromise = uncachedMatchIds.map(
        async (matchId: string) => {
          const response = await axios.get(
            `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            {
              headers: { 'X-Riot-Token': apiKey },
            }
          );

          // update rate limits from response headers
          await updateRateLimits(
            region,
            method,
            response.headers as Record<string, string>
          );

          // cache this match
          const cacheKey = `match:${region}:${matchId}`;
          await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(response.data));

          return response.data;
        }
      );

      // promise all requests
      const fetchedMatches = await Promise.all(matchDetailsPromise);
      matches.push(...fetchedMatches);
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error fetching match list:', error);

    // Check if this is a rate limit error from Riot
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      // Get retry-after header if available
      const retryAfter = error.response.headers['retry-after'];
      const retryMs = retryAfter ? parseInt(retryAfter) * 1000 : 10000; // Default to 10s

      // Create a rate limit response
      const rateLimitResponse: RateLimitResponse = {
        isRateLimited: true,
        rateLimits: { app: [], method: [] },
        retryAfter: retryMs,
      };

      const message = formatRateLimitMessage(rateLimitResponse);
      const headers = createRateLimitHeaders(rateLimitResponse);

      return NextResponse.json(
        {
          success: false,
          message,
          isRateLimited: true,
          retryAfter: retryMs,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // handle other known errors
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: `API Error: ${error.response?.statusText}` || error.message,
        },
        { status: error.response?.status || 500 }
      );
    }

    // unknown errors
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}
