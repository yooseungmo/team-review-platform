import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsEnum, IsString, MinLength, ValidateIf } from 'class-validator';
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

  @ApiProperty({ enum: Team, required: false, example: Team.DEV })
  @ValidateIf((o) => o.role === Role.PLANNER || o.role === Role.REVIEWER)
  @IsDefined() // PLANNER, REVIEWER 일 때는 반드시 있어야 함
  @IsEnum(Team)
  team?: Team;
}
