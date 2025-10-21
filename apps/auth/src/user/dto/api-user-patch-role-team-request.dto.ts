import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, ValidateIf } from 'class-validator';
import { Role, Team } from '../../../../../libs/common/src';

export class ApiUserPatchRoleTeamRequestDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ enum: Team, required: false })
  @ValidateIf((o) => o.role === Role.PLANNER || o.role === Role.REVIEWER)
  @IsEnum(Team, { message: 'PLANNER 또는 REVIEWER는 team이 필수입니다.' })
  team?: Team; // ADMIN/VIEWER면 생략 가능 (서비스에서 null 처리)
}
