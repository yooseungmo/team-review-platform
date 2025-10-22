import { ReviewStatus, Team } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReviewMyItemDto {
  @ApiProperty({ example: '66f01a2b3c4d5e6f77889900' }) @Expose() id: string;
  @ApiProperty({ example: '신규 직업 출시 이벤트' }) @Expose() name: string;
  @ApiProperty({ example: '스킬 밸런스 개편 포함' }) @Expose() description: string;
  @ApiProperty({ example: false }) @Expose() isConfidential: boolean;
  @ApiProperty({ example: '66f0...' }) @Expose() ownerId: string;

  @ApiProperty({ enum: Team, example: Team.QA, description: '내가 배정된 팀' })
  @Expose()
  myTeam: Team;

  @ApiProperty({
    enum: ReviewStatus,
    example: ReviewStatus.PENDING,
    description: '내 팀의 현재 상태',
  })
  @Expose()
  myStatus: ReviewStatus;

  @ApiProperty({ example: 'IN_PROGRESS' }) @Expose() finalStatus: string;
  @ApiProperty({ example: '2025-10-10T10:00:00.000Z' }) @Expose() startAt: Date;
  @ApiProperty({ example: '2025-10-20T10:00:00.000Z' }) @Expose() endAt: Date;
}
