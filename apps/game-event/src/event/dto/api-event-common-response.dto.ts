import { FinalStatus, ReviewStatus } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiEventCommonResponseDto {
  @ApiProperty({ example: '66f01a2b3c4d5e6f77889900' }) @Expose() id: string;

  @ApiProperty({ example: '프론티어 패스 시즌5' }) @Expose() name: string;
  @ApiProperty({ example: '새 시즌 패스 출시 및 보상 개편' }) @Expose() description: string;

  @ApiProperty({ example: '664a1b2c3d4e5f0011223344' }) @Expose() ownerId: string;

  @ApiProperty({ example: '2025-11-01T00:00:00.000Z' }) @Expose() startAt: Date;
  @ApiProperty({ example: '2025-11-30T23:59:59.000Z' }) @Expose() endAt: Date;

  @ApiProperty({ example: true }) @Expose() isConfidential: boolean;

  @ApiProperty({ example: '664a1b2c3d4e5f0011223344', nullable: true })
  @Expose()
  plannerReviewerId: string | null;

  @ApiProperty({ example: '6655aa22bb33cc4455667788', nullable: true }) @Expose() devReviewerId:
    | string
    | null;

  @ApiProperty({ example: '6099ee11ff22aa33bb44cc55', nullable: true }) @Expose() qaReviewerId:
    | string
    | null;

  @ApiProperty({ example: '60aa11bb22cc33dd44ee55ff', nullable: true }) @Expose() csReviewerId:
    | string
    | null;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  @Expose()
  pmStatus: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.NOT_REQUIRED })
  @Expose()
  devStatus: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PENDING })
  @Expose()
  qaStatus: ReviewStatus;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.NOT_REQUIRED })
  @Expose()
  csStatus: ReviewStatus;

  @ApiProperty({ enum: FinalStatus, example: FinalStatus.IN_PROGRESS })
  @Expose()
  finalStatus: FinalStatus;

  @ApiProperty({ example: null, nullable: true }) @Expose() approvedAt?: Date | null;

  @ApiProperty({ example: '2025-10-20T12:00:00.000Z' }) @Expose() createdAt: Date;
  @ApiProperty({ example: '2025-10-21T09:12:00.000Z' }) @Expose() updatedAt: Date;
}
