import { Role, Team } from '@app/common/roles.enum';
import { BadRequestException } from '@nestjs/common';

export const REVIEWER_TEAMS: ReadonlyArray<Team> = [Team.PM, Team.DEV, Team.QA, Team.CS] as const;

/**
 * 규칙:
 * - ADMIN/VIEWER → team=null
 * - PLANNER → team=PM
 * - REVIEWER → team ∈ {PM,DEV,QA,CS} (필수)
 */
export function normalizeRoleTeamOrThrow(role: Role, team?: Team | null): Team | null {
  if (role === Role.ADMIN || role === Role.VIEWER) {
    return null;
  }
  if (role === Role.PLANNER) {
    return Team.PM;
  }
  if (role === Role.REVIEWER) {
    if (!team) {
      throw new BadRequestException('REVIEWER는 team(PM/DEV/QA/CS) 지정이 필수입니다.');
    }
    if (!REVIEWER_TEAMS.includes(team)) {
      throw new BadRequestException('REVIEWER team은 PM/DEV/QA/CS 중 하나여야 합니다.');
    }
    return team;
  }
  throw new BadRequestException('Invalid role');
}
