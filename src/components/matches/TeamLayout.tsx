import { sortByRole } from '@/utils/functions';
import TeamMember from './TeamMember';
import { Match } from '@/utils/types';

type TeamLayoutProps = {
  match: Match;
};

const TeamLayout = ({ match }: TeamLayoutProps) => {
  const participants = match.info.participants;

  // Sort participants by their teams
  const team1 = participants.filter((p) => p.teamId === 100);
  const team2 = participants.filter((p) => p.teamId === 200);

  const sortedTeam1 = sortByRole(team1);
  const sortedTeam2 = sortByRole(team2);
  return (
    <div className='flex justify-end items-center col-span-3'>
      <div className='grid grid-cols-2 w-full'>
        {/* Left column for team1 */}
        <div className='flex flex-col '>
          {sortedTeam1.map((participant, index) => (
            <TeamMember key={index} participant={participant} />
          ))}
        </div>

        {/* Right column for team2 */}
        <div className='flex flex-col '>
          {sortedTeam2.map((participant, index) => (
            <TeamMember key={index} participant={participant} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default TeamLayout;
