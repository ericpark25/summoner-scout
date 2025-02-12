import ChampionList from '@/components/champions/ChampionList';
import MatchList from '@/components/matches/MatchList';
import Header from '@/components/summoner/Header';
import { fetchSummoner } from '@/utils/actions';
import { type SummonerWithRank } from '@/utils/types';

const SummonerPage = async ({
  params,
}: {
  params: { region: string; 'gameName-tagLine': string };
}) => {
  const { region, 'gameName-tagLine': gameNameTagLine } = await params;

  const [gameName, tagLine] = gameNameTagLine.split('-');
  const summonerData = await fetchSummoner(gameName, tagLine, region);
  console.log(summonerData);

  if ('success' in summonerData && !summonerData.success) {
    // error response case
    return (
      <div>
        <h1>Error</h1>
        <p>{summonerData.message}</p>
      </div>
    );
  }
  const validSummonerData = summonerData as SummonerWithRank;
  return (
    <section className='flex flex-col gap-y-8'>
      <Header validSummonerData={validSummonerData} />
      <section className='grid md:grid-cols-12 gap-x-12'>
        <ChampionList className='col-span-3 border' />
        <MatchList
          className='col-span-9'
          region={region}
          puuid={validSummonerData.puuid}
        />
      </section>
    </section>
  );
};

export default SummonerPage;
