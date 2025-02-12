// COME BACK TO SET MORE STRICT TYPE FOR MATCH AND PARTICIPANT
'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { MdKeyboardArrowDown } from 'react-icons/md';

type MatchProps = {
  match: any; // COME BACK TO SET MORE STRICT TYPE FOR MATCH
  puuid: string;
};

type ParticipantData = {
  participant?: any; // COME BACK TO SET MORE STRICT TYPE FOR PARTICIPANT
  win: boolean;
};

// get participant data and win result
function getParticipantData(match: any, puuid: string): ParticipantData {
  // look up the participant
  const participant = match.info.participants.find(
    (p: any) => p.puuid === puuid
  );
  const playerTeam = participant?.teamId;

  // find the team that matches the player's teamId
  const team = match.info.teams.find((t: any) => t.teamId === playerTeam);
  const win = team ? team.win : false;

  return { participant, win };
}

const Match = ({ match, puuid }: MatchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { participant, win } = useMemo(
    () => getParticipantData(match, puuid),
    [match, puuid]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className='w-full'>
      <CollapsibleTrigger asChild>
        <Card
          className={`shadow-none flex justify-between ${
            win ? 'bg-teal-300' : 'bg-rose-400'
          }`}
        >
          <div>{match.metadata.matchId}</div>
          <div className='flex justify-center items-center text-2xl bg-primary-foreground rounded-md'>
            <MdKeyboardArrowDown
              className={`text-primary ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
              <CardDescription>{participant.championName}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
export default Match;
