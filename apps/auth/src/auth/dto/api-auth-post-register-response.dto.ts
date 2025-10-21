import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role, Team } from '../../../../../libs/common/src';

export class ApiAuthPostRegisterResponseDto {
  @Expose()
  @ApiProperty({ example: '60f6c0d7b1234c001c9d4e5f' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'blanc' })
  username: string;

  @Expose()
  @ApiProperty({ example: 'blanc@gmail.com' })
  email: string;

  @Expose()
  @ApiProperty({ enum: Role, isArray: true })
  roles: Role[];

  @Expose()
  @ApiProperty({ enum: Team })
  team: Team;
}
