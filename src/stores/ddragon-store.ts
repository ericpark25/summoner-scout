import { create } from 'zustand';

interface DDragonStore {
  version: string;
  summonerSpellsMap: Record<number, string>;
  runesMap: Record<number, string>;
  runeTreeMap: Record<number, string>;
  isLoaded: boolean;
  fetchData: () => Promise<void>;
}

export const useDDragonStore = create<DDragonStore>((set, get) => ({
  version: '',
  summonerSpellsMap: {},
  runesMap: {},
  runeTreeMap: {},
  isLoaded: false,
  fetchData: async () => {
    // check is loaded; if loaded, do nothing
    if (get().isLoaded) return;
    // fetch latest patch version
    const versionResponse = await fetch(
      'https://ddragon.leagueoflegends.com/api/versions.json'
    );
    const versions = await versionResponse.json();
    const version = versions[0];

    // fetch summoner spells data and build map
    const summonerSpellsResponse = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`
    );
    const summonerSpellsData = await summonerSpellsResponse.json();
    const summonerSpellsMap: Record<number, string> = {};
    Object.values(summonerSpellsData.data).forEach((spell: any) => {
      summonerSpellsMap[Number(spell.key)] = spell.id;
    });

    // fetch runes data and build map
    const runesResponse = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`
    );
    const runesData = await runesResponse.json();
    const runesMap: Record<number, string> = {};
    const runeTreeMap: Record<number, string> = {};
    runesData.forEach((runeTree: any) => {
      // Save the top-level rune tree icon (for secondary style)
      runeTreeMap[runeTree.id] = runeTree.icon;
      // Then iterate through slots for individual runes (e.g., keystones)
      runeTree.slots.forEach((slot: any) => {
        slot.runes.forEach((rune: any) => {
          runesMap[rune.id] = rune.icon;
        });
      });
    });

    // update store state
    set({ version, summonerSpellsMap, runesMap, runeTreeMap, isLoaded: true });
  },
}));
