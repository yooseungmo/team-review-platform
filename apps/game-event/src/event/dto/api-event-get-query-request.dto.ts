import { FinalStatus } from '@app/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBooleanString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ApiEventGetQueryRequestDto {
  @ApiPropertyOptional({ example: '664a1b2c3d4e5f0011223344', description: '담당자(PLANNER) ID' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ enum: FinalStatus, example: FinalStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(FinalStatus)
  finalStatus?: FinalStatus;

  @ApiPropertyOptional({ example: 'true', description: '민감 여부 필터: true/false' })
  @IsOptional()
  @IsBooleanString()
  isConfidential?: string;

  @ApiPropertyOptional({ example: '2025-11-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  startFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  endTo?: string;

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
