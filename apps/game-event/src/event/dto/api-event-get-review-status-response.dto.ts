import { FinalStatus, ReviewStatus } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiEventGetReviewStatusResponseDto {
  @ApiProperty({ example: '66f01a2b3c4d5e6f77889900' }) @Expose() id: string;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  @Expose()
  pmStatus: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  @Expose()
  devStatus: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  @Expose()
  qaStatus: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.NOT_REQUIRED })
  @Expose()
  csStatus: ReviewStatus;

  @ApiProperty({ example: '2025-10-22T12:34:56.000Z', nullable: true })
  @Expose()
  pmReviewedAt?: Date | null;

  @ApiProperty({ example: null, nullable: true }) @Expose() devReviewedAt?: Date | null;
  @ApiProperty({ example: null, nullable: true }) @Expose() qaReviewedAt?: Date | null;
  @ApiProperty({ example: null, nullable: true }) @Expose() csReviewedAt?: Date | null;

  @ApiProperty({ enum: FinalStatus, example: FinalStatus.IN_PROGRESS })
  @Expose()
  finalStatus: FinalStatus;

  @ApiProperty({ example: null, nullable: true }) @Expose() approvedAt?: Date | null;
}
