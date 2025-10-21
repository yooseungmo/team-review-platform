import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiAuthPostRefreshResponseDto {
  @Expose()
  @ApiProperty({ example: 'new-access-token' })
  accessToken: string;
}
