'use server';

import axios from 'axios';
import {
  type RankedInfo,
  RiotAccountSchema,
  SummonerSchema,
} from '@/utils/types';
import { getRoutingValue } from './functions';

export const fetchSummoner = async (
  gameName: string,
  tagLine: string,
  region: string
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/summoner/${region}/${gameName}-${tagLine}`
  );
  if (!res.ok)
    throw new Error(
      `Failed to fetch summoner data: ${res.status} - ${res.statusText}`
    );
  return res.json();
};

export const getIconLink = async (profileIconId: number) => {
  const response = await axios.get(
    'https://ddragon.leagueoflegends.com/api/versions.json'
  );
  const version = response.data[0];
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`;
};
