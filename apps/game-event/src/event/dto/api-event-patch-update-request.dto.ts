import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class ApiEventPatchUpdateRequestDto {
  @ApiPropertyOptional({ example: '프론티어 패스 시즌5 (수정)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '보상 개편 + 추가 퀘스트' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2025-11-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2025-12-05T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @ApiPropertyOptional({ example: '664a1b2c3d4e5f0011223344', nullable: true })
  @IsOptional()
  @IsString()
  plannerReviewerId?: string | null;

  @ApiPropertyOptional({ example: '6655aa22bb33cc4455667788', nullable: true })
  @IsOptional()
  @IsString()
  devReviewerId?: string | null;

  @ApiPropertyOptional({ example: '6099ee11ff22aa33bb44cc55', nullable: true })
  @IsOptional()
  @IsString()
  qaReviewerId?: string | null;

  @ApiPropertyOptional({ example: '60aa11bb22cc33dd44ee55ff', nullable: true })
  @IsOptional()
  @IsString()
  csReviewerId?: string | null;

  @ApiPropertyOptional({ description: '옵티미스틱 락 버전', example: 3 })
  @IsOptional()
  v?: number;
}
