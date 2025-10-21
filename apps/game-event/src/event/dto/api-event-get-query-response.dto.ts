import { ApiProperty } from '@nestjs/swagger';
import { ApiEventCommonResponseDto } from './api-event-common-response.dto';

export class ApiEventGetQueryResponseDto {
  @ApiProperty({ type: [ApiEventCommonResponseDto] }) items: ApiEventCommonResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
