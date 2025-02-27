import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

const CACHE_TTL = 60 * 60 * 24 * 7; // 7days

type SummonerSpell = {
  key: string;
  id: string;
  name: string;
};

type SummonerSpellData = {
  data: Record<string, SummonerSpell>;
};

type Rune = {
  id: number;
  key: string;
  icon: string;
  name: string;
};

type RuneSlot = {
  runes: Rune[];
};

type RuneTree = {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: RuneSlot[];
};

type DDragonAssets = {
  version: string;
  summonerSpellsMap: Record<number, string>;
  runesMap: Record<number, string>;
  runeTreeMap: Record<number, string>;
};

export async function GET() {
  try {
    // try to get cached data from redis
    const cachedData = await redis.get('ddragon:assets');

    if (cachedData) {
      console.log('Using cached data for data dragon assets');
      return NextResponse.json(JSON.parse(cachedData) as DDragonAssets);
    }

    // if not in cache, fetch from API
    console.log('Fetching data dragon assets from API');

    // get latest version
    const versionResponse = await fetch(
      'https://ddragon.leagueoflegends.com/api/versions.json'
    );
    const versions = await versionResponse.json();
    const version = versions[0];

    // fetch summoner spells
    const summonerSpellsResponse = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`
    );
    const summonerSpellsData =
      (await summonerSpellsResponse.json()) as SummonerSpellData;
    const summonerSpellsMap: Record<number, string> = {};

    Object.values(summonerSpellsData.data).forEach((spell: SummonerSpell) => {
      summonerSpellsMap[Number(spell.key)] = spell.id;
    });

    // fetch runes data
    const runesResponse = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`
    );
    const runesData = (await runesResponse.json()) as RuneTree[];
    const runesMap: Record<number, string> = {};
    const runeTreeMap: Record<number, string> = {};

    runesData.forEach((runeTree: RuneTree) => {
      runeTreeMap[runeTree.id] = runeTree.icon;
      runeTree.slots.forEach((slot: RuneSlot) => {
        slot.runes.forEach((rune: Rune) => {
          runesMap[rune.id] = rune.icon;
        });
      });
    });

    // response data
    const responseData: DDragonAssets = {
      version,
      summonerSpellsMap,
      runesMap,
      runeTreeMap,
    };

    // cache data in redis
    await redis.set('ddragon:assets', JSON.stringify(responseData), {
      EX: CACHE_TTL,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching DDragon assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DDragon assets' },
      { status: 500 }
    );
  }
}
