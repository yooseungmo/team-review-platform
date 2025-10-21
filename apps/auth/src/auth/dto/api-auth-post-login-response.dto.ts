import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiAuthPostLoginResponseDto {
  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  accessToken: string;

  @Expose()
  @ApiProperty({ example: 'refresh-token-string' })
  refreshToken: string;
}
