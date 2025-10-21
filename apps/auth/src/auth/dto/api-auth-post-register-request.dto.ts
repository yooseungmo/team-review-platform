import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { Role, Team } from '../../../../../libs/common/src';

export class ApiAuthPostRegisterRequestDto {
  @ApiProperty({ example: 'blanc' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'blanc@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'blanc1233' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.VIEWER })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    enum: Team,
    required: false,
    nullable: true,
    description:
      'REVIEWER일 때만 필수. PLANNER는 자동으로 PM으로 설정, ADMIN/VIEWER는 null로 강제.',
    example: Team.DEV,
  })
  @IsOptional()
  @ValidateIf((o) => o.role === Role.REVIEWER)
  @IsEnum(Team, { message: 'REVIEWER는 team이 PM/DEV/QA/CS 중 하나여야 합니다.' })
  team?: Team | null;
}
