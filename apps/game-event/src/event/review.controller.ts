import { CurrentUser, Rbac, Role, Team, UserPayloadDto } from '@app/common';

import { JwtAuthGuard, RbacGuard } from '@app/common/guard';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiEventGetReviewHistoryResponseDto } from './dto/api-event-get-review-history-response.dto';
import { ApiEventGetReviewMyQueryRequestDto } from './dto/api-event-get-review-my-query-request.dto';
import { ApiEventGetReviewMyResponseDto } from './dto/api-event-get-review-my-response.dto';
import { ApiEventGetReviewStatusResponseDto } from './dto/api-event-get-review-status-response.dto';
import { ApiEventPatchReviewStatusRequestDto } from './dto/api-event-patch-review-status-request.dto';
import { ReviewService } from './review.service';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('events')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Get(':id/reviews/status')
  @ApiOperation({ summary: '이벤트 리뷰 상태 조회 (최종 상태 포함)' })
  @ApiParam({ name: 'id', description: '이벤트 ID', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200, type: ApiEventGetReviewStatusResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '접근 권한 없음(민감 이벤트)' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  getStatus(@CurrentUser() user: UserPayloadDto, @Param('id') id: string) {
    return this.service.getStatus(user, id);
  }

  @Get(':id/reviews/history')
  @ApiOperation({ summary: '리뷰 히스토리 조회 (누가/언제/무엇으로)' })
  @ApiParam({ name: 'id', description: '이벤트 ID', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200, type: ApiEventGetReviewHistoryResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  getHistory(@CurrentUser() user: UserPayloadDto, @Param('id') id: string) {
    return this.service.getHistory(user, id);
  }

  @Patch(':id/reviews/status')
  @Rbac(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: '리뷰 상태 업데이트 (REVIEWER/ADMIN)',
    description:
      '리뷰어는 본인 배정 팀만 변경 가능. ADMIN은 team 지정 시 대리 변경 가능. 상태 전이는 보통 PENDING → APPROVED/REJECTED.',
  })
  @ApiParam({ name: 'id', description: '이벤트 ID', example: '66f01a2b3c4d5e6f77889900' })
  @ApiBody({ type: ApiEventPatchReviewStatusRequestDto })
  @ApiResponse({
    status: 200,
    type: ApiEventGetReviewStatusResponseDto,
    description: '업데이트 성공',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청(상태 전이/팀 지정 등)' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음(리뷰어 배정X 등)' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '버전 충돌(동시 갱신)' })
  updateStatus(
    @CurrentUser() user: UserPayloadDto,
    @Param('id') id: string,
    @Body() dto: ApiEventPatchReviewStatusRequestDto,
  ) {
    return this.service.updateStatus(user, id, dto);
  }

  @Get('reviews/my')
  @Rbac(Role.REVIEWER, Role.ADMIN)
  @ApiOperation({ summary: '내 리뷰 작업함(배정된 이벤트)' })
  @ApiResponse({ status: 200, type: ApiEventGetReviewMyResponseDto })
  async listMy(
    @CurrentUser() user: UserPayloadDto,
    @Query() q: ApiEventGetReviewMyQueryRequestDto,
  ) {
    return this.service.listMyReviews(user, q);
  }

  @Get(':id/reviews/:team/history')
  @ApiOperation({ summary: '팀별 리뷰 히스토리 조회' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiParam({ name: 'team', enum: Team, example: Team.QA })
  @ApiResponse({ status: 200, type: ApiEventGetReviewHistoryResponseDto })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트 없음' })
  async getTeamHistory(
    @CurrentUser() user: UserPayloadDto,
    @Param('id') id: string,
    @Param('team', new ParseEnumPipe(Team)) team: Team,
  ) {
    return this.service.getTeamHistoryReviews(user, id, team);
  }
}
