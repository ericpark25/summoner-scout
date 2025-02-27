import { NextResponse } from 'next/server';
import axios from 'axios';
import { getRoutingValue } from '@/utils/functions';
import { redis } from '@/lib/redis';
import {
  type RankedInfo,
  RiotAccountSchema,
  SummonerSchema,
} from '@/utils/types';

export async function GET(
  request: Request,
  { params }: { params: { region: string; 'gameName-tagLine': string } }
) {
  const { region, 'gameName-tagLine': gameNameTagLine } = await params;
  const [gameName, tagLine] = gameNameTagLine.split('-');

  const apiKey = process.env.RIOT_API_KEY;
  const routingValue = getRoutingValue(region);

  // Check cache
  const cacheKey = `summoner:${region}:${gameName}:${tagLine}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  try {
    const accountResponse = await axios.get(
      `https://${routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { 'X-Riot-Token': apiKey } }
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

    const summonerData = {
      ...SummonerSchema.parse(summonerResponse.data),
      gameName: accountGameName,
      tagLine: accountTagLine,
    };

    const rankedResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
      { headers: { 'X-Riot-Token': apiKey } }
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

    // Handle known errors (e.g., invalid API key, rate limit exceeded, etc.)
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
