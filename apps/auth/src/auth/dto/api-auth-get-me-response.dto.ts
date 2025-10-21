import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role, Team } from '../../../../../libs/common/src';

export class ApiAuthGetMeResponseDto {
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
  @ApiProperty({ enum: Role, example: 'VIEWER' })
  role: Role;

  @Expose()
  @ApiProperty({ enum: Team, nullable: true, example: 'DEV' })
  team: Team | null;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: '2025-05-18T22:15:01.358Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-05-18T22:15:01.358Z' })
  updatedAt: Date;
}
