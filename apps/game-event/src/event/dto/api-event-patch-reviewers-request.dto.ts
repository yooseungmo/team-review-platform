import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ApiEventPatchReviewersRequestDto {
  @ApiPropertyOptional({
    example: '66f01a2b3c4d5e6f77889900',
    description: 'PM(기획) 리뷰어 ID 또는 null',
  })
  @IsOptional()
  @IsString()
  plannerReviewerId?: string | null;

  @ApiPropertyOptional({
    example: '66f01a2b3c4d5e6f77889901',
    description: 'DEV(개발) 리뷰어 ID 또는 null',
  })
  @IsOptional()
  @IsString()
  devReviewerId?: string | null;

  @ApiPropertyOptional({
    example: '66f01a2b3c4d5e6f77889902',
    description: 'QA 리뷰어 ID 또는 null',
  })
  @IsOptional()
  @IsString()
  qaReviewerId?: string | null;

  @ApiPropertyOptional({
    example: '66f01a2b3c4d5e6f77889903',
    description: 'CS 리뷰어 ID 또는 null',
  })
  @IsOptional()
  @IsString()
  csReviewerId?: string | null;

  @ApiPropertyOptional({ example: 1, description: '낙관적 락 버전(v). 최신 상태일 때만 갱신' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  v?: number;
}
