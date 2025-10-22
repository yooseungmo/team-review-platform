import { Rbac, Role } from '@app/common';
import { JwtAuthGuard, RbacGuard } from '@app/common/guard';
import { Controller, Delete, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller()
export class EventsProxyController {
  private readonly EVENTS: string;
  constructor(
    private readonly proxy: ProxyService,
    cs: ConfigService,
  ) {
    this.EVENTS = cs.getOrThrow('EVENT_BASE_URL');
  }

  // ----- Events CRUD -----
  @Post('/events')
  @Rbac(Role.ADMIN, Role.PLANNER)
  @ApiOperation({ summary: '이벤트 생성 (ADMIN/PLANNER)' })
  @ApiResponse({ status: 201 })
  create(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Get('/events')
  @ApiOperation({ summary: '이벤트 목록 조회 (권한 반영은 서비스에서)' })
  @ApiResponse({ status: 200 })
  list(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Get('/events/:id')
  @ApiOperation({ summary: '이벤트 단건 조회' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  getOne(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Patch('/events/:id')
  @Rbac(Role.ADMIN, Role.PLANNER)
  @ApiOperation({ summary: '이벤트 수정 (ADMIN/PLANNER 소유자)' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  patch(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Delete('/events/:id')
  @Rbac(Role.ADMIN, Role.PLANNER)
  @ApiOperation({ summary: '이벤트 삭제 (ADMIN/PLANNER 소유자)' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  remove(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  // ----- Reviews -----
  @Get('/events/:id/reviews/status')
  @ApiOperation({ summary: '리뷰 상태 조회 (최종 상태 포함)' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  status(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Get('/events/:id/reviews/history')
  @Rbac(Role.ADMIN, Role.PLANNER, Role.REVIEWER)
  @ApiOperation({ summary: '리뷰 히스토리 조회' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  history(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Get('/events/:id/reviews/:team/history')
  @Rbac(Role.ADMIN, Role.PLANNER, Role.REVIEWER)
  @ApiOperation({ summary: '팀별 리뷰 히스토리 조회' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiParam({ name: 'team', enum: ['PM', 'DEV', 'QA', 'CS'], example: 'QA' })
  @ApiResponse({ status: 200 })
  teamHistory(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Get('/events/reviews/my')
  @Rbac(Role.REVIEWER, Role.ADMIN)
  @ApiOperation({ summary: '내 리뷰 작업함 (팀/상태 필터, 페이지)' })
  @ApiResponse({ status: 200 })
  myReviews(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Patch('/events/:id/reviews/status')
  @Rbac(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({ summary: '리뷰 상태 변경 (REVIEWER/ADMIN)' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  updateStatus(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  @Patch('/events/:id/reviewers')
  @Rbac(Role.ADMIN, Role.PLANNER)
  @ApiOperation({ summary: '리뷰어 재지정 (ADMIN/PLANNER 소유자)' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  updateReviewers(@Req() req: Request, @Res() res: Response) {
    return this.pipe(req, res);
  }

  private async pipe(req: Request, res: Response) {
    const r = await this.proxy.forward(req, this.EVENTS);
    return res.status(r.status).set(r.headers).send(r.data);
  }
}
