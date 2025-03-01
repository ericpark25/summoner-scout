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
import { useToast } from '@/hooks/use-toast';
import RateLimitAlert from '../global/RateLimitAlert';

type MatchListProps = {
  className?: string;
};

type MatchesResponse = {
  matches: MatchType[];
  nextPage: number | undefined;
};

type RateLimitError = {
  success: false;
  message: string;
  isRateLimited: true;
  retryAfter: number;
};

const fetchMatches = async ({
  pageParam = 0,
  queryKey,
}: {
  pageParam?: number;
  queryKey: any;
}): Promise<MatchesResponse> => {
  const [_, region, puuid] = queryKey; // queryKey in this case is ['matches', region, puuid]

  try {
    // fetch match ids
    const matchIdsResponse = await axios.get(
      `/api/matches/${region}/${puuid}`,
      {
        params: { start: pageParam, count: 10 },
      }
    );

    // Check if this is a rate limit response
    if (matchIdsResponse.data.isRateLimited) {
      throw {
        success: false,
        message: matchIdsResponse.data.message,
        isRateLimited: true,
        retryAfter: matchIdsResponse.data.retryAfter,
      } as RateLimitError;
    }

    const matchIdsData = MatchIdsResponseSchema.parse(matchIdsResponse.data);

    // if no match ids are returned, end is reached
    if (matchIdsData.length === 0) {
      return { matches: [], nextPage: undefined };
    }

    const matchDetailsResponse = await axios.post(`/api/matches/${region}`, {
      matchIds: matchIdsData,
    });
    // Check if this is a rate limit response
    if (matchDetailsResponse.data.isRateLimited) {
      throw {
        success: false,
        message: matchDetailsResponse.data.message,
        isRateLimited: true,
        retryAfter: matchDetailsResponse.data.retryAfter,
      } as RateLimitError;
    }
    const matchDetailsData = MatchDetailsResponseSchema.parse(
      matchDetailsResponse.data
    );

    // return match details and next page start parameter
    return {
      matches: matchDetailsData.matches,
      nextPage: pageParam + matchIdsData.length,
    };
  } catch (error) {
    // Check if this is a rate limit error (status 429)
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      // Extract rate limit data from the error response
      const responseData = error.response.data;

      throw {
        success: false,
        message: responseData.message || 'Rate limit exceeded',
        isRateLimited: true,
        retryAfter: responseData.retryAfter || 10000,
      } as RateLimitError;
    }

    // Re-throw other errors
    throw error;
  }
};

const MatchList = ({ className }: MatchListProps) => {
  const { toast } = useToast();
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
    refetch,
  } = useInfiniteQuery({
    queryKey: ['matches', region, puuid],
    queryFn: fetchMatches,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: canFetchMatches,
    retry: false,
  });

  const matches = data?.pages.flatMap((page) => page.matches) || [];
  console.log(matches);

  // Handle specific rate limit errors
  const isRateLimited =
    error && 'isRateLimited' in error && error.isRateLimited;
  const rateLimitMessage =
    isRateLimited && 'message' in error ? (error.message as string) : '';
  const retryAfter =
    isRateLimited && 'retryAfter' in error
      ? (error.retryAfter as number)
      : undefined;

  // console.log('Rate limit detection:', {
  //   isRateLimited,
  //   rateLimitMessage,
  //   retryAfter,
  // });

  const handleRetry = () => {
    refetch();
    toast({
      title: 'Retrying',
      description: 'Attempting to fetch matches again.',
    });
  };

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

  // Show rate limit error
  if (isRateLimited) {
    return (
      <div className={className}>
        <h1 className='text-2xl font-bold tracking-wide text-primary'>
          Match History
        </h1>
        <RateLimitAlert
          message={rateLimitMessage}
          retryAfter={retryAfter}
          onRetry={handleRetry}
        />
        {matches.length > 0 && (
          <>
            <div className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
              Showing previously loaded matches while we wait for the rate limit
              to reset.
            </div>
            <ul className='flex flex-col gap-y-2'>
              {matches.map((match) => (
                <li key={match.metadata.matchId}>
                  <Match match={match} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  if (error && !isRateLimited) {
    return (
      <div className={className}>
        <h1 className='text-2xl font-bold tracking-wide text-primary'>
          Match History
        </h1>
        <div className='py-8 text-center text-red-500'>
          Error loading matches:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
          <Button
            variant='outline'
            onClick={() => refetch()}
            className='mt-4 mx-auto block'
          >
            Try Again
          </Button>
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
