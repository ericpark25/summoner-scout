import { z } from 'zod';

export const RiotAccountSchema = z.object({
  puuid: z.string(),
  gameName: z.string(),
  tagLine: z.string(),
});

export type RiotAccount = z.infer<typeof RiotAccountSchema>;

export const SummonerSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  puuid: z.string(),
  profileIconId: z.number(),
  revisionDate: z.number(),
  summonerLevel: z.number(),
});

export type Summoner = z.infer<typeof SummonerSchema>;

export type SummonerType = {
  gameName: string;
  tagLine: string;
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
};

export type Match = {
  gameId: string;
  champion: string;
  result: 'Victory' | 'Defeat';
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  duration: string;
  gameMode: string;
  queueId: number;
  timestamp: number;
};

export type RankedInfo = {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type SummonerWithRank = SummonerType & {
  rankedInfo: RankedInfo[];
};
