import { type SummonerWithRank } from '@/utils/types';

import { getIconLink } from '@/utils/actions';
import Image from 'next/image';
import UserCard from './UserCard';
import RankCard from './RankCard';
const Header = async ({
  validSummonerData,
}: {
  validSummonerData: SummonerWithRank;
}) => {
  const { gameName, tagLine, summonerLevel, profileIconId, rankedInfo } =
    validSummonerData;
  const iconLink = await getIconLink(profileIconId);

  return (
    <section className='flex justify-center gap-x-6 xl:gap-x-12 flex-wrap mt-8 gap-y-4'>
      <UserCard
        iconLink={iconLink}
        summonerLevel={summonerLevel}
        gameName={gameName}
        tagLine={tagLine}
      />
      <RankCard rankedInfo={rankedInfo} />
    </section>
  );
};
export default Header;
