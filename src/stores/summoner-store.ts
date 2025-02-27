import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SummonerStore {
  // state
  region: string;
  summonerName: string;
  tagLine: string;
  puuid: string;

  // actions
  setRegion: (region: string) => void;
  setSummonerName: (summonerName: string) => void;
  setTagLine: (tagLine: string) => void;
  setPuuid: (puuid: string) => void;

  //set all summoner info at once for convenience
  setSummonerInfo: (info: {
    region: string;
    summonerName: string;
    tagLine: string;
    puuid: string;
  }) => void;
}

export const useSummonerStore = create<SummonerStore>()(
  persist(
    (set) => ({
      region: 'na1',
      summonerName: '',
      tagLine: '',
      puuid: '',

      setRegion: (region) => set({ region }),
      setSummonerName: (summonerName) => set({ summonerName }),
      setTagLine: (tagLine) => set({ tagLine }),
      setPuuid: (puuid) => set({ puuid }),

      // Add a convenience method to set all info at once
      setSummonerInfo: (info) =>
        set({
          region: info.region,
          summonerName: info.summonerName,
          tagLine: info.tagLine,
          puuid: info.puuid,
        }),
    }),
    {
      name: 'summoner-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      // Skip storage on server-side
      skipHydration: true,
    }
  )
);

// Hydration helper for server components
export function initializeSummonerStore(
  region: string,
  summonerName: string,
  tagLine: string,
  puuid: string
) {
  useSummonerStore.getState().setRegion(region);
  useSummonerStore.getState().setSummonerName(summonerName);
  useSummonerStore.getState().setTagLine(tagLine);
  useSummonerStore.getState().setPuuid(puuid);
}
