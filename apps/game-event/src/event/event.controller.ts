import { CurrentUser, UserPayloadDto } from '@app/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiEventCommonResponseDto } from './dto/api-event-common-response.dto';
import { ApiEventGetQueryRequestDto } from './dto/api-event-get-query-request.dto';
import { ApiEventGetQueryResponseDto } from './dto/api-event-get-query-response.dto';
import { ApiEventPatchReviewersRequestDto } from './dto/api-event-patch-reviewers-request.dto';
import { ApiEventPatchUpdateRequestDto } from './dto/api-event-patch-update-request.dto';
import { ApiEventPostCreateRequestDto } from './dto/api-event-post-create-request.dto';
import { EventService } from './event.service';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@Controller('events')
export class EventController {
  constructor(private readonly service: EventService) {}

  @Post()
  @ApiOperation({
    summary: '이벤트 생성',
    description: `PLANNER 또는 ADMIN만 생성 가능. 리뷰어가 지정된 팀은 PENDING, 미지정은 NOT_REQUIRED로 초기화되고 finalStatus는 자동 계산됩니다.`,
  })
  @ApiBody({ type: ApiEventPostCreateRequestDto })
  @ApiResponse({ status: 201, type: ApiEventCommonResponseDto, description: '생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청(날짜/필드 불일치 등)' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async create(@CurrentUser() user: UserPayloadDto, @Body() dto: ApiEventPostCreateRequestDto) {
    return this.service.create(user, dto);
  }

  @Get()
  @ApiOperation({
    summary: '이벤트 목록 조회',
    description: `VIEWER: 비민감만, PLANNER: 본인 담당 + 공개, REVIEWER: 본인 배정 + 공개, ADMIN: 전체. 필터/페이지네이션 제공.`,
  })
  @ApiResponse({ status: 200, type: ApiEventGetQueryResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async findAll(@CurrentUser() user: UserPayloadDto, @Query() q: ApiEventGetQueryRequestDto) {
    return this.service.findAllVisibleTo(user, q);
  }

  @Get(':id')
  @ApiOperation({ summary: '이벤트 단건 조회 (민감 접근 제어)' })
  @ApiParam({ name: 'id', description: '이벤트 ID', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200, type: ApiEventCommonResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '접근 권한 없음(민감 이벤트)' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  async findOne(@CurrentUser() user: UserPayloadDto, @Param('id') id: string) {
    return this.service.findOneVisibleTo(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '이벤트 수정 (ADMIN 또는 담당자)' })
  @ApiParam({ name: 'id', description: '이벤트 ID', example: '66f01a2b3c4d5e6f77889900' })
  @ApiBody({ type: ApiEventPatchUpdateRequestDto })
  @ApiResponse({ status: 200, type: ApiEventCommonResponseDto, description: '수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 또는 버전 불일치' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음(소유자/ADMIN 아님)' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '버전 충돌(동시 수정)' })
  async update(
    @CurrentUser() user: UserPayloadDto,
    @Param('id') id: string,
    @Body() dto: ApiEventPatchUpdateRequestDto,
  ) {
    return this.service.updateByOwnerOrAdmin(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '이벤트 삭제 (ADMIN 또는 담당자)' })
  @ApiParam({ name: 'id', description: '이벤트 ID', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200, description: '삭제 성공: { success: true }' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음(소유자/ADMIN 아님)' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  async remove(@CurrentUser() user: UserPayloadDto, @Param('id') id: string) {
    return this.service.removeByOwnerOrAdmin(user, id);
  }

  @Patch(':id/reviewers')
  @ApiOperation({ summary: '이벤트 리뷰어 재지정 (ADMIN/PLANNER 소유자)' })
  @ApiParam({ name: 'id', description: '이벤트 ID', example: '66f01a2b3c4d5e6f77889900' })
  @ApiBody({ type: ApiEventPatchReviewersRequestDto })
  @ApiResponse({
    status: 200,
    type: ApiEventCommonResponseDto,
    description: '리뷰어와 상태가 갱신됨',
  })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음(소유자 아님)' })
  @ApiResponse({ status: 404, description: '이벤트 없음' })
  @ApiResponse({ status: 409, description: '버전 충돌' })
  patchReviewers(
    @CurrentUser() user: UserPayloadDto,
    @Param('id') id: string,
    @Body() dto: ApiEventPatchReviewersRequestDto,
  ) {
    return this.service.updateReviewers(user, id, dto);
  }
}
