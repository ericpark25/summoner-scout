// COME BACK TO SET MORE STRICT TYPE FOR MATCH AND PARTICIPANT
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { MdKeyboardArrowDown } from 'react-icons/md';
import TeamLayout from './TeamLayout';
import { matchQueueType, calculateKillParticipation } from '@/utils/functions';
import { formatDistanceToNow } from 'date-fns';
import { useDDragonStore } from '@/stores/ddragon-store';
import ExpandedMatch from './ExpandedMatch';
import { useSummonerStore } from '@/stores/summoner-store';
import {
  type Match as MatchType,
  type Participant,
  MatchSchema,
} from '@/utils/types';

type MatchProps = {
  match: MatchType;
};

type ParticipantData = {
  participant?: Participant;
  win: boolean;
};

// get participant data and win result
function getParticipantData(match: MatchType, puuid: string): ParticipantData {
  // look up the participant
  const participant = match.info.participants.find((p) => p.puuid === puuid);

  if (!participant) {
    return { win: false };
  }

  const playerTeam = participant.teamId;

  // find the team that matches the player's teamId
  const team = match.info.teams.find((t) => t.teamId === playerTeam);
  const win = team ? team.win : false;

  return { participant, win };
}

const Match = ({ match }: MatchProps) => {
  // validate match data using zod schema
  try {
    MatchSchema.parse(match);
  } catch (error) {
    console.error('Invalid match data:', error);
    return (
      <Card className='bg-gray-800 text-white border-none shadow-none p-4'>
        <div className='text-center'>
          Match data could not be loaded properly
        </div>
      </Card>
    );
  }

  const [isOpen, setIsOpen] = useState(false);

  // get from summonerStore
  const { puuid } = useSummonerStore();

  const { participant, win } = useMemo(
    () => getParticipantData(match, puuid),
    [match, puuid]
  );

  if (!participant) {
    return (
      <Card className='bg-gray-800 text-white border-none shadow-none p-4'>
        <div className='text-center'>
          Could not find data for current summoner
        </div>
      </Card>
    );
  }

  const gameType = matchQueueType(match.info.queueId) || match.info.gameMode;
  const timeAgo = formatDistanceToNow(new Date(match.info.gameEndTimestamp), {
    addSuffix: true,
  });
  const gameDuration = `${Math.floor(match.info.gameDuration / 60)}:${(
    match.info.gameDuration % 60
  )
    .toString()
    .padStart(2, '0')}`;
  const cs =
    participant.totalMinionsKilled + (participant.neutralMinionsKilled ?? 0);
  const csPerMin = ((cs / match.info.gameDuration) * 60).toFixed(1);
  const killParticipation = calculateKillParticipation(match, participant);

  // ddragon store for assets
  const version = useDDragonStore((state) => state.version);
  const summonerSpellsMap = useDDragonStore((state) => state.summonerSpellsMap);

  // lookup the spell names from the map
  const summonerSpell1Name = summonerSpellsMap[participant.summoner1Id] || '';
  const summonerSpell2Name = summonerSpellsMap[participant.summoner2Id] || '';

  // construct data dragon URL for the summoner spell icons
  const summonerSpell1Url =
    version && summonerSpell1Name
      ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${summonerSpell1Name}.png`
      : '/placeholder.png';
  const summonerSpell2Url =
    version && summonerSpell2Name
      ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${summonerSpell2Name}.png`
      : '/placeholder.png';

  // runes assets from datadragon store
  const runesMap = useDDragonStore((state) => state.runesMap);
  const runeTreeMap = useDDragonStore((state) => state.runeTreeMap);

  // for the keystone rune, convert the ID to a number
  const keystoneRuneId = Number(participant.perks.styles[0].selections[0].perk);
  // lookup its icon path in the runesMap
  const keystoneRuneIconPath = runesMap[keystoneRuneId] || '';
  // build URL; data dragon rune icons are hosted at a static URL (no patch version needed)
  const keystoneRuneUrl = keystoneRuneIconPath
    ? `https://ddragon.leagueoflegends.com/cdn/img/${keystoneRuneIconPath}`
    : '/placeholder.png';

  // for the secondary rune style, use runeTreeMap
  const secondaryStyleId = Number(participant.perks.styles[1].style);
  const secondaryRuneIconPath = runeTreeMap[secondaryStyleId] || '';
  const secondaryRuneUrl = secondaryRuneIconPath
    ? `https://ddragon.leagueoflegends.com/cdn/img/${secondaryRuneIconPath}`
    : '/placeholder.png';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card
          className={`${
            win ? 'bg-blue-800' : 'bg-red-800'
          } text-white border-none shadow-none`}
        >
          <div className='p-2 grid grid-cols-12 gap-4 items-center'>
            {/* game info */}
            <div className='col-span-2 flex flex-col'>
              <h3 className='font-bold'>{participant.championName}</h3>
              <span className='text-sm font-medium'>{gameType}</span>
              <span className='text-xs text-slate-400'>{timeAgo}</span>
              <span
                className={`text-sm ${win ? 'text-blue-400' : 'text-red-400'}`}
              >
                {win ? 'Victory' : 'Defeat'}
              </span>
              <span className='text-xs text-slate-400'>{gameDuration}</span>
            </div>

            {/* Champion Info */}
            <div className='col-span-2 flex items-center gap-2'>
              <div className='relative flex flex-col items-center justify-center'>
                <img
                  src={`/champions/${participant.championName}_0.jpg`}
                  alt={participant.championName}
                  className='w-12 h-12 rounded-full'
                />
                <span className='absolute bottom-0 right-0 bg-slate-900 text-xs px-1 rounded'>
                  {participant.champLevel}
                </span>
              </div>
              <div className='flex flex-col'>
                <div className='flex gap-1'>
                  <img
                    src={summonerSpell1Url}
                    alt='Summoner Spell 1'
                    className='w-5 h-5 rounded'
                  />
                  <img
                    src={summonerSpell2Url}
                    alt='Summoner Spell 2'
                    className='w-5 h-5 rounded'
                  />
                </div>
                <div className='flex gap-1 mt-1'>
                  <img
                    src={keystoneRuneUrl}
                    alt='Keystone'
                    className='w-5 h-5 rounded'
                  />
                  <img
                    src={secondaryRuneUrl}
                    alt='Secondary Rune'
                    className='w-4 h-4 rounded'
                  />
                </div>
              </div>
            </div>

            {/* KDA */}
            <div className='col-span-2 flex flex-col'>
              <div className='text-sm font-medium'>
                {participant.kills} / {participant.deaths} /{' '}
                {participant.assists}
              </div>
              <div className='text-xs text-slate-400'>
                {(
                  (participant.kills + participant.assists) /
                  Math.max(1, participant.deaths)
                ).toFixed(2)}{' '}
                KDA
              </div>
            </div>

            {/* Stats */}
            <div className='col-span-2 flex flex-col text-xs text-slate-400'>
              <div>
                CS {cs} ({csPerMin})
              </div>
              <div>Vision {participant.visionScore}</div>
              <div>P/Kill {killParticipation}%</div>
            </div>

            {/* Team Layout */}
            <TeamLayout match={match} />

            {/* Expand Arrow */}
            <div className='col-span-1 flex justify-end'>
              <MdKeyboardArrowDown
                className={`text-2xl transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ExpandedMatch match={match} participant={participant} />
      </CollapsibleContent>
    </Collapsible>
  );
};
export default Match;
