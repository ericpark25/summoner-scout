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

// cache ttl for match lists set to 5 minutes
const CACHE_TTL = 300;

export async function GET(
  request: Request,
  { params }: { params: { region: string; puuid: string } }
) {
  const { puuid, region } = await params;
  const routingValue = await getRoutingValue(region);
  const apiKey = process.env.RIOT_API_KEY;

  // search params
  const { searchParams } = new URL(request.url);

  // parse query params for pagination
  const start = parseInt(searchParams.get('start') || '0', 10);
  const count = parseInt(searchParams.get('count') || '10', 10);

  // check cache
  const cacheKey = `matches:${region}:${puuid}:${start}:${count}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  // check rate limits before making requests
  const method = 'matches';
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

  try {
    // record request to inc counters
    await recordRequest(region, method);

    const matchListResponse = await axios.get(
      `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      {
        headers: { 'X-Riot-Token': apiKey },
        params: {
          start,
          count,
        },
      }
    );
    console.log(
      'App rate limit:',
      matchListResponse.headers['x-app-rate-limit']
    );
    console.log(
      'Method rate limit:',
      matchListResponse.headers['x-method-rate-limit']
    );
    // update rate limits from response headers
    await updateRateLimits(
      region,
      method,
      matchListResponse.headers as Record<string, string>
    );

    const matchListData = matchListResponse.data;

    // cache data
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(matchListData));

    return NextResponse.json(matchListData);
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
