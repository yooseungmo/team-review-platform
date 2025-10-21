import { Rbac, Role } from '@app/common';
import { JwtAuthGuard, RbacGuard } from '@app/common/guard';
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUserGetByIdResponseDto } from './dto/api-user-get-by-id-response.dto';
import { ApiUserGetQueryRequestDto } from './dto/api-user-get-query-request.dto';
import { ApiUserGetQueryResponseDto } from './dto/api-user-get-query-response.dto';
import { ApiUserPatchRoleTeamRequestDto } from './dto/api-user-patch-role-team-request.dto';
import { ApiUserPatchRoleTeamResponseDto } from './dto/api-user-patch-role-team-response.dto';
import { ApiUserPatchStatusRequestDto } from './dto/api-user-patch-status-request.dto';
import { ApiUserPatchStatusResponseDto } from './dto/api-user-patch-status-response.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 상세 조회 (ADMIN)' })
  @ApiResponse({ status: 200, type: ApiUserGetByIdResponseDto })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get('')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 목록 조회 (ADMIN) — filter + pagination' })
  @ApiResponse({ status: 200, type: ApiUserGetQueryResponseDto })
  async list(@Query() q: ApiUserGetQueryRequestDto) {
    return this.userService.listUsers(q);
  }

  @Patch(':id/role-team')
  @Rbac(Role.ADMIN)
  @ApiOperation({
    summary: '사용자 역할/팀 변경 (ADMIN)',
    description: `
    ### 역할 및 팀 규칙
      - ADMIN / VIEWER → team=null (고정)
      - PLANNER → team=PM (고정)
      - REVIEWER → team ∈ {PM, DEV, QA, CS} (필수 지정)
  `,
  })
  @ApiResponse({ status: 200, type: ApiUserPatchRoleTeamResponseDto })
  updateRoleTeam(@Param('id') id: string, @Body() dto: ApiUserPatchRoleTeamRequestDto) {
    return this.userService.updateUserRoleTeam(id, dto);
  }

  @Patch('users/:id/status')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 활성/비활성 (ADMIN)' })
  @ApiResponse({ status: 200, type: ApiUserPatchStatusResponseDto })
  updateStatus(@Param('id') id: string, @Body() dto: ApiUserPatchStatusRequestDto) {
    return this.userService.updateUserStatus(id, dto);
  }
}
