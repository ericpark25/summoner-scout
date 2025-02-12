'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Match from './Match';
import { Button } from '../ui/button';

type MatchListProps = {
  className?: string;
  region: string;
  puuid: string;
};

const MatchList = ({ className, puuid, region }: MatchListProps) => {
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [start, setStart] = useState<number>(0);
  const countPerBatch = 10;
  const [showLoadMore, setShowLoadMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // disabled initial match history fetch on render due to rate limits
  // useEffect(() => {
  //   // fetch match ids on mount
  //   handleFetchMatchIds();
  // }, []);

  async function handleFetchMatchIds() {
    setLoading(true);
    try {
      const matchIdsResponse = await axios.get(
        `/api/matches/${region}/${puuid}`,
        {
          params: { start, count: countPerBatch },
        }
      );
      const matchIdsData: string[] = matchIdsResponse.data;

      if (matchIdsData.length > 0) {
        // fetch match details for these ids
        const matchDetailsResponse = await axios.post(
          `/api/matches/${region}`,
          {
            matchIds: matchIdsData,
          }
        );

        const matchDetailsData = matchDetailsResponse.data;
        console.log(matchDetailsData);

        // update states
        setMatchIds((prev) => [...prev, ...matchIdsData]);
        setMatches((prev) => [...prev, ...matchDetailsData.matches]);
      }

      // update start and showLoadMore state
      setStart((prev) => prev + countPerBatch);
      // 70 is the soft limit for match history due to rate limits
      if (matchIds.length + matchIdsData.length >= 70) {
        setShowLoadMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${className}`}>
      <h1 className='text-2xl font-bold tracking-wide text-primary'>
        Match History
      </h1>
      <ul className=' flex flex-col gap-y-2'>
        {matches.map((match) => {
          return (
            <li key={match.metadata.matchId}>
              <Match match={match} puuid={puuid} />
            </li>
          );
        })}
      </ul>
      {showLoadMore && (
        <Button
          variant={'ghost'}
          onClick={handleFetchMatchIds}
          disabled={loading}
          className='w-full bg-primary text-primary-foreground hover:bg-blue-700 hover:text-primary-foreground'
        >
          {loading ? 'Loading...' : 'Load Matches'}
        </Button>
      )}
    </div>
  );
};
export default MatchList;
