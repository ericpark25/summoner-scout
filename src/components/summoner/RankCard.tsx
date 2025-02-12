import { RankedInfo } from '@/utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { calculateWinRate, formatRankQueueType } from '@/utils/functions';

type RankCardProps = {
  rankedInfo: RankedInfo[];
};
const RankCard = ({ rankedInfo }: RankCardProps) => {
  const ranked = rankedInfo.length > 0;
  return (
    <Card className='w-full md:w-1/2 lg:w-fill bg-primary-foreground'>
      <CardHeader>
        <CardTitle className='text-xl mx-auto font-bold text-primary tracking-wider'>
          Rank
        </CardTitle>
      </CardHeader>
      <CardContent className='flex justify-around flex-wrap gap-y-2'>
        {ranked &&
          rankedInfo.map((item) => {
            return (
              <div
                key={item.queueType}
                className='border-2 border-primary px-8 py-2 rounded-lg'
              >
                <h2 className='font-bold text-center'>
                  {formatRankQueueType(item.queueType)}
                </h2>
                <p className='text-center'>
                  {item.tier} {item.rank}: {item.leaguePoints} LP
                </p>
                <p className='text-center'>
                  {item.wins}W {item.losses}L:{' '}
                  {calculateWinRate(item.wins, item.losses)}
                </p>
              </div>
            );
          })}
        {!ranked && <p>Unranked</p>}
      </CardContent>
    </Card>
  );
};
export default RankCard;
