import { NextResponse } from 'next/server';
import axios from 'axios';
import { getRoutingValue } from '@/utils/functions';
import { redis } from '@/lib/redis';
import {
  type RankedInfo,
  RiotAccountSchema,
  SummonerSchema,
} from '@/utils/types';
import {
  checkRateLimits,
  createRateLimitHeaders,
  formatRateLimitMessage,
  RateLimitResponse,
  recordRequest,
  updateRateLimits,
} from '@/lib/rate-limiter';

export async function GET(
  request: Request,
  { params }: { params: { region: string; 'gameName-tagLine': string } }
) {
  const { region, 'gameName-tagLine': gameNameTagLine } = await params;
  const [gameName, tagLine] = gameNameTagLine.split('-');

  const apiKey = process.env.RIOT_API_KEY;
  const routingValue = getRoutingValue(region);

  // check cache
  const cacheKey = `summoner:${region}:${gameName}:${tagLine}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Using summoner data from cache');
    return NextResponse.json(JSON.parse(cached));
  }

  // check rate limits before making requests
  const method = 'summoner';
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
    console.log('Fetching summoner data from Riot API');
    // record request to inc counters
    await recordRequest(region, method);

    const accountResponse = await axios.get(
      `https://${routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { 'X-Riot-Token': apiKey } }
    );
    console.log('App rate limit:', accountResponse.headers['x-app-rate-limit']);
    console.log(
      'Method rate limit:',
      accountResponse.headers['x-method-rate-limit']
    );

    // update rate limits from response headers #1
    await updateRateLimits(
      region,
      method,
      accountResponse.headers as Record<string, string>
    );

    const riotAccountData = RiotAccountSchema.parse(accountResponse.data);
    const {
      puuid,
      gameName: accountGameName,
      tagLine: accountTagLine,
    } = riotAccountData;

    const summonerResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': apiKey } }
    );
    console.log(
      'App rate limit:',
      summonerResponse.headers['x-app-rate-limit']
    );
    console.log(
      'Method rate limit:',
      summonerResponse.headers['x-method-rate-limit']
    );
    // update rate limits #2
    await updateRateLimits(
      region,
      method,
      summonerResponse.headers as Record<string, string>
    );

    const summonerData = {
      ...SummonerSchema.parse(summonerResponse.data),
      gameName: accountGameName,
      tagLine: accountTagLine,
    };

    const rankedResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
      { headers: { 'X-Riot-Token': apiKey } }
    );

    console.log('App rate limit:', rankedResponse.headers['x-app-rate-limit']);
    console.log(
      'Method rate limit:',
      rankedResponse.headers['x-method-rate-limit']
    );
    // update rate limits #3
    await updateRateLimits(
      region,
      method,
      rankedResponse.headers as Record<string, string>
    );

    const rankedInfo: RankedInfo[] = rankedResponse.data;

    const result = {
      ...summonerData,
      rankedInfo,
    };

    // Store in cache
    await redis.setEx(cacheKey, 300, JSON.stringify(result)); // Cache for 5 minutes

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching summoner data:', error);

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

    // handle other known errors (e.g., invalid API key, etc.)
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: `API Error: ${error.response?.statusText || error.message}`,
        },
        { status: error.response?.status || 500 }
      );
    }

    // Unknown errors
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}
