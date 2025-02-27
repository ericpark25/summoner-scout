import { formatDistanceToNow } from 'date-fns';
import { Match as MatchType, Participant } from './types';

export function formatTimeAgo(timestamp: number): string {
  const date = new Date(timestamp);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });

  if (timeAgo.includes('less than a day')) {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  return timeAgo;
}

export const getRoutingValue = (region: string): string => {
  const regionLower = region.toLowerCase();
  if (['na1', 'br1', 'la1', 'la2'].includes(regionLower)) {
    return 'americas';
  } else if (['kr'].includes(regionLower)) {
    return 'asia';
  } else if (['euw1', 'eun1', 'tr1', 'ru'].includes(regionLower)) {
    return 'europe';
  } else if (['oc1', 'ph2', 'sg2', 'th1', 'tw2', 'vn2'].includes(regionLower)) {
    return 'sea';
  }
  throw new Error(`Unsupported region: ${region}`);
};

export function getGameModeLabel(gameMode: string, queueId: number): string {
  if (gameMode === 'ARAM') return 'ARAM';

  switch (queueId) {
    case 420:
      return 'Ranked Solo';
    case 440:
      return 'Ranked Flex';
    case 400:
      return 'Normal Draft';
    case 430:
      return 'Quickplay';
    case 1700:
      return 'Arena';
    case 450:
      return 'ARAM';
    default:
      return gameMode;
  }
}

export function formatRankQueueType(queueType: string): string {
  switch (queueType) {
    case 'RANKED_SOLO_5x5':
      return 'Ranked Solo/Duo';
    case 'RANKED_FLEX_SR':
      return 'Ranked Flex';
    default:
      return queueType;
  }
}

export function calculateWinRate(wins: number, losses: number): string {
  const totalGames = wins + losses;
  if (totalGames === 0) return '0%';
  return `${((wins / totalGames) * 100).toFixed(2)}%`;
}

// sort a team based on their role
export const sortByRole = (team: Participant[]) => {
  const roleOrder = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];

  return team.sort((a, b) => {
    const aPosition = a.teamPosition || a.individualPosition || '';
    const bPosition = b.teamPosition || b.individualPosition || '';

    return (
      roleOrder.indexOf(aPosition as string) -
      roleOrder.indexOf(bPosition as string)
    );
  });
};

// truncate text when it exceeds a certain length
export const truncateText = (text: string, limit: number) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
};

// queueId to gameMode
export const matchQueueType = (queueId: number) => {
  switch (queueId) {
    case 0:
      return 'Custom';
    case 420:
      return 'Ranked Solo';
    case 440:
      return 'Ranked Flex';
    case 400:
      return 'Normal Draft';
    case 430:
      return 'Normal Blind';
    case 450:
      return 'ARAM';
    case 900:
      return 'ARURF';
    case 76:
      return 'URF';
    default:
      return '';
  }
};

export function calculateKillParticipation(
  match: MatchType,
  participant: Participant
): number {
  // Get all participants on the player's team
  const teamParticipants = match.info.participants.filter(
    (p) => p.teamId === participant.teamId
  );

  // Calculate total team kills
  const totalTeamKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0);

  // If the team has no kills, return 0 to avoid division by zero
  if (totalTeamKills === 0) {
    return 0;
  }

  // Calculate the player's contribution (kills + assists)
  const playerContribution = participant.kills + participant.assists;

  // Calculate kill participation percentage
  const killParticipation = (playerContribution / totalTeamKills) * 100;

  // Return rounded to one decimal place
  return Math.round(killParticipation * 10) / 10;
}
