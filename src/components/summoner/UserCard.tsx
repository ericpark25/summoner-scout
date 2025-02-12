import Image from 'next/image';
import { Card, CardHeader, CardTitle } from '../ui/card';

type UserCardProps = {
  iconLink: string;
  summonerLevel: number;
  gameName: string;
  tagLine: string;
};

const UserCard = ({
  iconLink,
  summonerLevel,
  gameName,
  tagLine,
}: UserCardProps) => {
  return (
    <Card className='w-full md:w-1/2 lg:w-1/3 flex justify-center bg-primary-foreground'>
      <CardHeader className='flex-row gap-x-12 items-center justify-center'>
        <div className='relative'>
          {iconLink && (
            <Image
              src={iconLink}
              alt='profile icon'
              width={100}
              height={100}
              className='rounded-lg'
              priority
            />
          )}
          <span className='absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white rounded-xl h-7 w-7 flex justify-center items-center text-xs font-bold'>
            {summonerLevel}
          </span>
        </div>
        <div>
          <CardTitle className='text-2xl text-primary'>
            {gameName}
            <span className='ml-2 text-xl text-stone-600'>#{tagLine}</span>
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
};
export default UserCard;
