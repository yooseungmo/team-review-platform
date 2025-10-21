import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ApiUserPatchStatusRequestDto {
  @ApiProperty({ example: false, description: '활성화 여부' })
  @IsBoolean()
  isActive: boolean;
}
