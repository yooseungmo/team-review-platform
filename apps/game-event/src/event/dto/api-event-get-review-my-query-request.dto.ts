import { ReviewStatus, Team } from '@app/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ApiEventGetReviewMyQueryRequestDto {
  @ApiPropertyOptional({
    enum: ReviewStatus,
    example: ReviewStatus.PENDING,
    description: '내 팀 상태 필터',
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({ enum: Team, example: Team.QA, description: '팀 필터(PM/DEV/QA/CS)' })
  @IsOptional()
  @IsEnum(Team)
  team?: Team;

  @ApiPropertyOptional({ example: 1, description: '페이지 번호 (1부터)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? Number(value) : 1))
  page: number;

  @ApiPropertyOptional({ example: 20, description: '페이지 크기' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => (value ? Number(value) : 20))
  limit: number;
}
