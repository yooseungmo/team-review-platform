import { Role, Team } from '@app/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ApiUserGetQueryRequestDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: Team })
  @IsOptional()
  @IsEnum(Team)
  team?: Team;

  @ApiPropertyOptional({ description: 'username/email 부분검색' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => String(value).trim())
  search?: string;

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
