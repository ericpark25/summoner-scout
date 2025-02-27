'use client';

import axios from 'axios';
import Match from './Match';
import { Button } from '../ui/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSummonerStore } from '@/stores/summoner-store';
import {
  type Match as MatchType,
  MatchIdsResponseSchema,
  MatchDetailsResponseSchema,
} from '@/utils/types';

type MatchListProps = {
  className?: string;
};

type MatchesResponse = {
  matches: MatchType[];
  nextPage: number | undefined;
};

const fetchMatches = async ({
  pageParam = 0,
  queryKey,
}: {
  pageParam?: number;
  queryKey: any;
}): Promise<MatchesResponse> => {
  const [_, region, puuid] = queryKey; // queryKey in this case is ['matches', region, puuid]

  // fetch match ids
  const matchIdsResponse = await axios.get(`/api/matches/${region}/${puuid}`, {
    params: { start: pageParam, count: 10 },
  });
  const matchIdsData = MatchIdsResponseSchema.parse(matchIdsResponse.data);

  // if no match ids are returned, end is reached
  if (matchIdsData.length === 0) {
    return { matches: [], nextPage: undefined };
  }

  const matchDetailsResponse = await axios.post(`/api/matches/${region}`, {
    matchIds: matchIdsData,
  });
  const matchDetailsData = MatchDetailsResponseSchema.parse(
    matchDetailsResponse.data
  );

  // return match details and next page start parameter
  return {
    matches: matchDetailsData.matches,
    nextPage: pageParam + matchIdsData.length,
  };
};

const MatchList = ({ className }: MatchListProps) => {
  // get region and puuid from summonerStore
  const { region, puuid } = useSummonerStore();
  const canFetchMatches = Boolean(region && puuid && puuid.length > 0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['matches', region, puuid],
    queryFn: fetchMatches,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: canFetchMatches,
    retry: 1,
  });

  const matches = data?.pages.flatMap((page) => page.matches) || [];
  console.log(matches);

  if (!canFetchMatches) {
    return (
      <div className={className}>
        <h1 className='text-2xl font-bold tracking-wide text-primary'>
          Match History
        </h1>
        <div className='py-8 text-center text-slate-500'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h1 className='text-2xl font-bold tracking-wide text-primary'>
          Match History
        </h1>
        <div className='py-8 text-center text-red-500'>
          Error loading matches:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h1 className='text-2xl font-bold tracking-wide text-primary'>
        Match History
      </h1>
      {isLoading ? (
        <div className='py-8 text-center text-slate-500'>
          Loading matches...
        </div>
      ) : matches.length === 0 ? (
        <div className='py-8 text-center text-slate-500'>No matches found</div>
      ) : (
        <>
          <ul className='flex flex-col gap-y-2'>
            {matches.map((match) => (
              <li key={match.metadata.matchId}>
                <Match match={match} />
              </li>
            ))}
          </ul>
          {hasNextPage && (
            <Button
              variant={'ghost'}
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className='w-full bg-primary text-primary-foreground hover:bg-blue-700 hover:text-primary-foreground'
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More Matches'}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
export default MatchList;
