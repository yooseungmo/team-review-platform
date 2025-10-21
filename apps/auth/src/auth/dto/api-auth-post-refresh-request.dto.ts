import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApiAuthPostRefreshRequestDto {
  /** 브라우저 환경이면 RT를 httpOnly+Secure 쿠키에서 추출방식으로 개선 */
  @ApiProperty({ example: 'refresh-token-string' })
  @IsString()
  refreshToken: string;
}
