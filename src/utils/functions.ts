import { formatDistanceToNow } from 'date-fns';

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
