import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ReviewHistoryItemDto } from './review-history-item.dto';

export class ApiEventGetReviewHistoryResponseDto {
  @ApiProperty({ example: '66f01a2b3c4d5e6f77889900' }) @Expose() id: string;

  @ApiProperty({ type: [ReviewHistoryItemDto] })
  @Type(() => ReviewHistoryItemDto)
  @Expose()
  items: ReviewHistoryItemDto[];
}
