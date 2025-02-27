import { NextResponse } from 'next/server';
import axios from 'axios';
import { getRoutingValue } from '@/utils/functions';

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

    // for each match id, fetch match details in parallel
    const matchDetailsPromise = matchIds.map(async (matchId: string) => {
      const response = await axios.get(
        `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: { 'X-Riot-Token': apiKey },
        }
      );
      return response.data;
    });

    const matches = await Promise.all(matchDetailsPromise);
    return NextResponse.json({ matches });
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
