import { ReviewStatus, Team } from '@app/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ApiEventPatchReviewStatusRequestDto {
  @ApiProperty({
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
    description: '리뷰 상태(보통 PENDING → APPROVED/REJECTED로 변경)',
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({
    example: '테스트 시나리오 통과. 이슈 없음.',
    description: '코멘트(선택)',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    enum: Team,
    example: Team.QA,
    description:
      '선택: ADMIN이 대리 변경 시 지정 가능. REVIEWER는 생략해도 본인 배정 팀으로 자동 매칭.',
  })
  @IsOptional()
  @IsEnum(Team)
  team?: Team;

  @ApiPropertyOptional({ example: 1, description: '옵티미스틱 락 버전(v). 없으면 무시' })
  @IsOptional()
  v?: number;
}
