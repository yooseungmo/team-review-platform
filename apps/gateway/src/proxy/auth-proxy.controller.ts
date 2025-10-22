import { Public, Rbac, Role } from '@app/common';
import { JwtAuthGuard, RbacGuard } from '@app/common/guard';
import { Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller()
export class AuthProxyController {
  private readonly AUTH: string;
  constructor(
    private readonly proxy: ProxyService,
    cs: ConfigService,
  ) {
    this.AUTH = cs.getOrThrow('AUTH_BASE_URL');
  }

  // ---------- Auth ----------
  @Public()
  @Post('/auth/register')
  @ApiOperation({ summary: '사용자 등록 (Gateway → Auth)' })
  @ApiBody({
    schema: {
      example: {
        username: 'blanc',
        email: 'blanc@gmail.com',
        password: 'pw1234',
        role: 'VIEWER',
        team: null,
      },
    },
  })
  @ApiResponse({ status: 201 })
  register(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  @Public()
  @Post('/auth/login')
  @ApiOperation({ summary: '로그인 (Gateway → Auth)' })
  @ApiBody({ schema: { example: { email: 'blanc@gmail.com', password: 'pw1234' } } })
  @ApiResponse({ status: 200 })
  login(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  @Public()
  @Post('/auth/refresh')
  @ApiOperation({ summary: '로그인 연장 (Refresh in body → Access 재발급)' })
  @ApiBody({ schema: { example: { refreshToken: '...' } } })
  @ApiResponse({ status: 200 })
  refresh(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  @Post('/auth/logout')
  @ApiOperation({ summary: '로그아웃 (Access 필요)' })
  @ApiResponse({ status: 200 })
  logout(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  @Get('/auth/me')
  @ApiOperation({ summary: '내 프로필 (Access 필요)' })
  @ApiResponse({ status: 200 })
  me(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  // ---------- Users (ADMIN) ----------
  @Get('/users')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 목록 조회 (ADMIN) — filter + pagination' })
  @ApiResponse({ status: 200 })
  listUsers(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  @Get('/users/:id')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 상세 조회 (ADMIN)' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiResponse({ status: 200 })
  getUser(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  @Patch('/users/:id/role-team')
  @Rbac(Role.ADMIN)
  @ApiOperation({
    summary: '사용자 역할/팀 변경 (ADMIN)',
    description: `ADMIN/VIEWER → team=null, PLANNER → team=PM, REVIEWER → team∈{PM,DEV,QA,CS}`,
  })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiBody({ schema: { example: { role: 'REVIEWER', team: 'QA' } } })
  @ApiResponse({ status: 200 })
  patchRoleTeam(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  @Patch('/users/:id/status')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 활성/비활성 (ADMIN)' })
  @ApiParam({ name: 'id', example: '66f01a2b3c4d5e6f77889900' })
  @ApiBody({ schema: { example: { isActive: true } } })
  @ApiResponse({ status: 200 })
  patchStatus(@Req() req: Request, @Res() res: Response) {
    return this.pipeAuth(req, res);
  }

  private async pipeAuth(req: Request, res: Response) {
    const r = await this.proxy.forward(req, this.AUTH);
    return res.status(r.status).set(r.headers).send(r.data);
  }
}
