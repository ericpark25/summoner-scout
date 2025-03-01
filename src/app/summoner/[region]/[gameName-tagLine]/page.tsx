import ChampionList from '@/components/champions/ChampionList';
import MatchList from '@/components/matches/MatchList';
import Header from '@/components/summoner/Header';
import { fetchSummoner } from '@/utils/actions';
import { type SummonerWithRank } from '@/utils/types';
import DDragonLoader from '@/components/store/DDragonLoader';
import SummonerStoreInitializer from '@/components/store/SummonerStoreInitializer';
import RateLimitAlert from '@/components/global/RateLimitAlert';

const SummonerPage = async ({
  params,
}: {
  params: { region: string; 'gameName-tagLine': string };
}) => {
  const { region, 'gameName-tagLine': gameNameTagLine } = await params;

  const [gameName, tagLine] = gameNameTagLine.split('-');
  const summonerData = await fetchSummoner(gameName, tagLine, region);
  // console.log(summonerData);

  // handle rate limit error
  if (
    'success' in summonerData &&
    !summonerData.success &&
    summonerData.isRateLimited
  ) {
    return (
      <section className='flex flex-col gap-y-8'>
        <div className='mx-auto max-w-xl py-12 text-center'>
          <h1 className='text-3xl font-bold text-primary mb-6'>
            Rate Limit Reached
          </h1>
          <RateLimitAlert
            message={summonerData.message}
            retryAfter={summonerData.retryAfter}
          />
          <p className='mt-4 text-muted-foreground'>
            We've reached Riot API's rate limit. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  // other error responses
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
      <SummonerStoreInitializer
        region={region}
        summonerName={gameName}
        tagLine={tagLine}
        puuid={validSummonerData.puuid}
      />

      <DDragonLoader />
      <Header validSummonerData={validSummonerData} />
      <section className='grid md:grid-cols-12 gap-x-12'>
        <ChampionList className='col-span-3 border' />
        <MatchList className='col-span-9' />
      </section>
    </section>
  );
};

export default SummonerPage;
