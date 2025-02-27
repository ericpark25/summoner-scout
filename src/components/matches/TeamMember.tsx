import { truncateText } from '@/utils/functions';
import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { useSummonerStore } from '@/stores/summoner-store';
import { Participant } from '@/utils/types';

const TEXT_LIMIT = 10;

type TeamMemberProps = {
  participant: Participant;
};
const TeamMember = ({ participant }: TeamMemberProps) => {
  const { region } = useSummonerStore(); // from summonerStore

  const hasRiotId = participant.riotIdGameName && participant.riotIdTagline;

  // compute display values based on whether Riot ID exists or not
  const displayName = hasRiotId
    ? participant.riotIdGameName
    : participant.summonerName;
  const tooltipText = hasRiotId
    ? `${participant.riotIdGameName} #${participant.riotIdTagline}`
    : participant.summonerName;
  const memberLink = hasRiotId
    ? `/summoner/${region}/${participant.riotIdGameName}-${participant.riotIdTagline}`
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex items-center gap-2'>
            <img
              src={`/champions/${participant.championName}_0.jpg`}
              alt={participant.championName}
              className='h-4 w-4 rounded-full'
            />
            {memberLink ? (
              <Link
                href={`/summoner/${region}/${participant.riotIdGameName}-${participant.riotIdTagline}`}
                className=' hover:text-slate-300'
              >
                <div className='text-xs'>
                  {truncateText(participant.riotIdGameName, TEXT_LIMIT)}
                </div>
              </Link>
            ) : (
              <div className='text-xs'>
                {truncateText(participant.summonerName, TEXT_LIMIT)}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className='bg-slate-900 text-white border-none px-1.5 py-0.75 text-xs rounded-md'>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default TeamMember;
