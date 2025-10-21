import { IsValidRoleTeamPair, Role, Team } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class ApiUserPatchRoleTeamRequestDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ enum: Team, required: false, nullable: true })
  @IsEnum(Team, { message: 'team must be one of PM,DEV,QA,CS', each: false })
  @IsValidRoleTeamPair({
    message:
      'role/team mismatch: ADMIN/VIEWER → team=null, PLANNER → team=PM, REVIEWER → team in {PM,DEV,QA,CS}',
  })
  team?: Team | null;
}
