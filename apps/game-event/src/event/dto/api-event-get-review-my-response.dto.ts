import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ReviewMyItemDto } from './review-my-item.dto';

export class ApiEventGetReviewMyResponseDto {
  @ApiProperty({ type: [ReviewMyItemDto] })
  @Expose()
  @Type(() => ReviewMyItemDto)
  items: ReviewMyItemDto[];

  @ApiProperty({ example: 2 }) @Expose() total: number;
  @ApiProperty({ example: 1 }) @Expose() page: number;
  @ApiProperty({ example: 20 }) @Expose() limit: number;
}
