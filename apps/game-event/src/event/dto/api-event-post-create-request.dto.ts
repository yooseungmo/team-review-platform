import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class ApiEventPostCreateRequestDto {
  @ApiProperty({ example: '프론티어 패스 시즌5' })
  @IsString()
  name: string;

  @ApiProperty({ example: '새 시즌 패스 출시 및 보상 개편' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2025-11-01T00:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2025-11-30T23:59:59.000Z' })
  @IsDateString()
  endAt: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isConfidential: boolean;

  @ApiPropertyOptional({
    description: 'PM 리뷰어 ID',
    example: '664a1b2c3d4e5f0011223344',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  plannerReviewerId?: string | null;

  @ApiPropertyOptional({
    description: 'DEV 리뷰어 ID',
    example: '6655aa22bb33cc4455667788',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  devReviewerId?: string | null;

  @ApiPropertyOptional({
    description: 'QA 리뷰어 ID',
    example: '6099ee11ff22aa33bb44cc55',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  qaReviewerId?: string | null;

  @ApiPropertyOptional({
    description: 'CS 리뷰어 ID',
    example: '60aa11bb22cc33dd44ee55ff',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  csReviewerId?: string | null;
}
