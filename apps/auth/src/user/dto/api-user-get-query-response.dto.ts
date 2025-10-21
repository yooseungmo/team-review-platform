import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ApiUserSummaryDto } from './user-summary.dto';

export class ApiUserGetQueryResponseDto {
  @Expose()
  @ApiProperty({ type: [ApiUserSummaryDto] })
  items: ApiUserSummaryDto[];

  @ApiProperty() total: number;

  @ApiProperty() page: number;

  @ApiProperty()
  limit: number;
}
