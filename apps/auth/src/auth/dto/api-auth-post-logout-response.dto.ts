import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiAuthPostLogoutResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  success: boolean;
}
