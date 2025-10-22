import { Team } from '@app/common';

type TeamKey = 'pm' | 'dev' | 'qa' | 'cs';

export const teamToKey: Record<Team, TeamKey> = {
  [Team.PM]: 'pm',
  [Team.DEV]: 'dev',
  [Team.QA]: 'qa',
  [Team.CS]: 'cs',
};
