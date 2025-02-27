import { create } from 'zustand';

interface DDragonStore {
  version: string;
  summonerSpellsMap: Record<number, string>;
  runesMap: Record<number, string>;
  runeTreeMap: Record<number, string>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useDDragonStore = create<DDragonStore>((set, get) => ({
  version: '',
  summonerSpellsMap: {},
  runesMap: {},
  runeTreeMap: {},
  isLoaded: false,
  isLoading: false,
  error: null,
  fetchData: async () => {
    // Check if already loaded or loading
    if (get().isLoaded || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      // Fetch from our API endpoint that handles caching
      const response = await fetch('/api/ddragon');

      if (!response.ok) {
        throw new Error(`Failed to fetch DDragon data: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the store with the fetched data
      set({
        version: data.version,
        summonerSpellsMap: data.summonerSpellsMap,
        runesMap: data.runesMap,
        runeTreeMap: data.runeTreeMap,
        isLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching DDragon data:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },
}));
