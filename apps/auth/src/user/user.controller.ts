import { Rbac, Role } from '@app/common';
import { JwtAuthGuard, RbacGuard } from '@app/common/guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUserGetByIdResponseDto } from './dto/api-user-get-by-id-response.dto';
import { ApiUserGetQueryRequestDto } from './dto/api-user-get-query-request.dto';
import { ApiUserGetQueryResponseDto } from './dto/api-user-get-query-response.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users/:id')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 상세 조회 (ADMIN)' })
  @ApiResponse({ status: 200, type: ApiUserGetByIdResponseDto })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get('users')
  @Rbac(Role.ADMIN)
  @ApiOperation({ summary: '사용자 목록 조회 (ADMIN) — filter + pagination' })
  @ApiResponse({ status: 200, type: ApiUserGetQueryResponseDto })
  async list(@Query() q: ApiUserGetQueryRequestDto) {
    return this.userService.listUsers(q);
  }
}
