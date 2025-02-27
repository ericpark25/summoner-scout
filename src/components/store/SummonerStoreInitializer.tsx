'use client';

import { useEffect } from 'react';
import { useSummonerStore } from '@/stores/summoner-store';

// handles hydrating the Zustand store on the client
export default function SummonerStoreInitializer({
  region,
  summonerName,
  tagLine,
  puuid,
}: {
  region: string;
  summonerName: string;
  tagLine: string;
  puuid: string;
}) {
  const { setSummonerInfo } = useSummonerStore();

  // set store values on mount (client-side only)
  useEffect(() => {
    setSummonerInfo({
      region,
      summonerName,
      tagLine,
      puuid,
    });
  }, [region, summonerName, tagLine, puuid, setSummonerInfo]);

  // this is just a initializer, no UI
  return null;
}
