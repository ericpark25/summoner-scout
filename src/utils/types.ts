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

// COME BACK and set types for participant and match

// types and schemas for match and participant data
// participant schema
export const ParticipantSchema = z
  .object({
    // basic info
    puuid: z.string(),
    teamId: z.number(),

    // champ info
    championName: z.string(),
    champLevel: z.number(),

    // summoner/riot id info
    summonerName: z.string(),
    riotIdGameName: z.string(),
    riotIdTagline: z.string(),

    // spells and runes
    summoner1Id: z.number(),
    summoner2Id: z.number(),
    perks: z
      .object({
        styles: z.array(
          z.object({
            style: z.number(),
            selections: z.array(
              z
                .object({
                  perk: z.number(),
                })
                .passthrough()
            ),
          })
        ),
      })
      .passthrough(), // Allow other perks properties

    // Score and Stats
    kills: z.number(),
    deaths: z.number(),
    assists: z.number(),

    // CS (Creep Score)
    totalMinionsKilled: z.number(),
    neutralMinionsKilled: z.number().optional(),

    // Vision
    visionScore: z.number(),

    // Allow any other fields to pass through
  })
  .passthrough();

// team schema
export const TeamSchema = z
  .object({
    teamId: z.number(),
    win: z.boolean(),
  })
  .passthrough();

// match metadata schema
export const MatchMetadataSchema = z
  .object({
    matchId: z.string(),
  })
  .passthrough();

// match info schema
export const MatchInfoSchema = z
  .object({
    gameDuration: z.number(),
    gameEndTimestamp: z.number(),
    gameMode: z.string(),
    queueId: z.number(),
    participants: z.array(ParticipantSchema),
    teams: z.array(TeamSchema),
  })
  .passthrough();

// match schema using metadata and info schemas
export const MatchSchema = z
  .object({
    metadata: MatchMetadataSchema,
    info: MatchInfoSchema,
  })
  .passthrough();

// typescript types
export type Participant = z.infer<typeof ParticipantSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type MatchMetadata = z.infer<typeof MatchMetadataSchema>;
export type MatchInfo = z.infer<typeof MatchInfoSchema>;
export type Match = z.infer<typeof MatchSchema>;

// API response schemas
export const MatchIdsResponseSchema = z.array(z.string());
export const MatchDetailsResponseSchema = z.object({
  matches: z.array(MatchSchema),
});
