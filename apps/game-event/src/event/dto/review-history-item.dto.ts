import { ReviewStatus, Team } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReviewHistoryItemDto {
  @ApiProperty({ enum: Team, example: Team.QA }) @Expose() team: Team;
  @ApiProperty({ example: '6655aa22bb33cc4455667788' }) @Expose() reviewerId: string;
  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  @Expose()
  prevStatus: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.APPROVED })
  @Expose()
  nextStatus: ReviewStatus;

  @ApiProperty({ example: '테스트 통과', nullable: true }) @Expose() comment?: string;
  @ApiProperty({ example: '2025-10-22T12:34:56.000Z' }) @Expose() changedAt: Date;
}
