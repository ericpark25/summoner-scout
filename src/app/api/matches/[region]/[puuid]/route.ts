import { NextResponse } from 'next/server';
import axios from 'axios';
import { getRoutingValue } from '@/utils/functions';

export async function GET(
  request: Request,
  { params }: { params: { region: string; puuid: string } }
) {
  const { puuid } = params;
  const routingValue = getRoutingValue(params.region);
  const apiKey = process.env.RIOT_API_KEY;

  // search params
  const { searchParams } = new URL(request.url);

  // parse query params for pagination
  const start = parseInt(searchParams.get('start') || '0', 10);
  const count = parseInt(searchParams.get('count') || '10', 10);

  try {
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
    const matchListData = matchListResponse.data;
    return NextResponse.json(matchListData);
  } catch (error) {
    console.error('Error fetching match list:', error);

    // handle known errors
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
