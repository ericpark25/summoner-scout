'use server';

import axios from 'axios';

export const fetchSummoner = async (
  gameName: string,
  tagLine: string,
  region: string
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/summoner/${region}/${gameName}-${tagLine}`
    );
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 429) {
        // parse rate limit information from headers
        const retryAfter = res.headers.get('Retry-After');
        const retryMs = retryAfter ? parseInt(retryAfter) * 1000 : 10000;

        return {
          success: false,
          message:
            data.message || 'Rate limit exceeded. Please try again later.',
          isRateLimited: true,
          retryAfter: retryMs,
        };
      }

      return {
        success: false,
        message:
          data.message ||
          `Failed to fetch summoner data: ${res.status} - ${res.statusText}`,
      };
    }
    return data;
  } catch (error) {
    console.error('Error in fetchSummoner:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};

export const getIconLink = async (profileIconId: number) => {
  const response = await axios.get(
    'https://ddragon.leagueoflegends.com/api/versions.json'
  );
  const version = response.data[0];
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`;
};
