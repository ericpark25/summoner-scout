'use client';

import { Match, Participant } from '@/utils/types';
import { Card } from '../ui/card';

type ExpandedMatchProps = {
  match: Match;
  participant: Participant;
};

const ExpandedMatch = ({ match, participant }: ExpandedMatchProps) => {
  // Get the teams from the match
  const playerTeam = match.info.participants.filter(
    (p) => p.teamId === participant.teamId
  );
  const enemyTeam = match.info.participants.filter(
    (p) => p.teamId !== participant.teamId
  );

  // Find the corresponding teams in match.info.teams
  const playerTeamInfo = match.info.teams.find(
    (team) => team.teamId === participant.teamId
  );
  const enemyTeamInfo = match.info.teams.find(
    (team) => team.teamId !== participant.teamId
  );

  return (
    <Card className='p-4 bg-slate-900 text-white'>
      <div className='grid grid-cols-2 gap-4'>
        {/* Player Team */}
        <div>
          <h3 className='text-lg font-bold mb-2'>
            {playerTeamInfo?.win ? 'Victory' : 'Defeat'} Team
          </h3>
          <div className='space-y-2'>
            {playerTeam.map((p) => (
              <div key={p.puuid} className='flex items-center gap-2'>
                <img
                  src={`/champions/${p.championName}_0.jpg`}
                  alt={p.championName}
                  className='w-8 h-8 rounded-full'
                />
                <div className='flex-grow'>
                  <div className='font-medium'>
                    {p.riotIdGameName || p.summonerName}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium'>
                    {p.kills}/{p.deaths}/{p.assists}
                  </div>
                  <div className='text-sm text-slate-400'>
                    CS: {p.totalMinionsKilled + (p.neutralMinionsKilled ?? 0)}
                  </div>
                  <div className='text-sm text-slate-400'>
                    Vision: {p.visionScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enemy Team */}
        <div>
          <h3 className='text-lg font-bold mb-2'>
            {enemyTeamInfo?.win ? 'Victory' : 'Defeat'} Team
          </h3>
          <div className='space-y-2'>
            {enemyTeam.map((p) => (
              <div key={p.puuid} className='flex items-center gap-2'>
                <img
                  src={`/champions/${p.championName}_0.jpg`}
                  alt={p.championName}
                  className='w-8 h-8 rounded-full'
                />
                <div className='flex-grow'>
                  <div className='font-medium'>
                    {p.riotIdGameName || p.summonerName}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium'>
                    {p.kills}/{p.deaths}/{p.assists}
                  </div>
                  <div className='text-sm text-slate-400'>
                    CS: {p.totalMinionsKilled + (p.neutralMinionsKilled ?? 0)}
                  </div>
                  <div className='text-sm text-slate-400'>
                    Vision: {p.visionScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Match Duration and Mode */}
      <div className='mt-4 pt-4 border-t border-slate-700'>
        <h3 className='text-lg font-bold mb-2'>Match Details</h3>
        <div>
          <p>
            Game Duration: {Math.floor(match.info.gameDuration / 60)}:
            {(match.info.gameDuration % 60).toString().padStart(2, '0')}
          </p>
          <p>Game Mode: {match.info.gameMode}</p>
        </div>
      </div>
    </Card>
  );
};

export default ExpandedMatch;
