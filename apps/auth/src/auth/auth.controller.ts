import { CurrentUser, Public, UserPayloadDto } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiAuthGetMeResponseDto } from './dto/api-auth-get-me-response.dto';
import { ApiAuthPostLoginRequestDto } from './dto/api-auth-post-login-request.dto';
import { ApiAuthPostLoginResponseDto } from './dto/api-auth-post-login-response.dto';
import { ApiAuthPostLogoutResponseDto } from './dto/api-auth-post-logout-response.dto';
import { ApiAuthPostRefreshRequestDto } from './dto/api-auth-post-refresh-request.dto';
import { ApiAuthPostRefreshResponseDto } from './dto/api-auth-post-refresh-response.dto';
import { ApiAuthPostRegisterRequestDto } from './dto/api-auth-post-register-request.dto';
import { ApiAuthPostRegisterResponseDto } from './dto/api-auth-post-register-response.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: '사용자 등록',
    description: `
    ### 역할 및 팀 규칙
      - ADMIN / VIEWER → team=null (고정)
      - PLANNER → team=PM (고정)
      - REVIEWER → team ∈ {PM, DEV, QA, CS} (필수 지정)
  `,
  })
  @ApiBody({ type: ApiAuthPostRegisterRequestDto })
  @ApiResponse({ status: 201, type: ApiAuthPostRegisterResponseDto })
  @ApiResponse({ status: 400, description: '유효성 오류 또는 역할/팀 규칙 위반' })
  @ApiResponse({ status: 409, description: '이메일 중복' })
  register(@Body() dto: ApiAuthPostRegisterRequestDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: ApiAuthPostLoginRequestDto })
  @ApiResponse({ status: 200, type: ApiAuthPostLoginResponseDto })
  @ApiResponse({ status: 200, type: ApiAuthPostLoginResponseDto, description: '로그인 성공' })
  @ApiResponse({ status: 400, description: '유효성 오류' })
  @ApiResponse({ status: 401, description: '미존재 사용자 / 비활성 계정 / 비밀번호 불일치' })
  login(@Body() dto: ApiAuthPostLoginRequestDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '로그인 연장 (Access Token 재발급)' })
  @ApiBody({ type: ApiAuthPostRefreshRequestDto })
  @ApiResponse({ status: 200, type: ApiAuthPostRefreshResponseDto })
  @ApiResponse({ status: 400, description: '유효성 오류' })
  @ApiResponse({
    status: 401,
    description: '만료/형식오류/불일치 리프레시 토큰 또는 미존재/비활성 사용자',
  })
  async refresh(@Body() dto: ApiAuthPostRefreshRequestDto): Promise<ApiAuthPostRefreshResponseDto> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, type: ApiAuthPostLogoutResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패 또는 사용자 없음' })
  async logout(@CurrentUser() user: UserPayloadDto): Promise<ApiAuthPostLogoutResponseDto> {
    return this.authService.logout(user.sub);
  }

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회(Access Token 검증)' })
  @ApiResponse({ status: 200, type: ApiAuthGetMeResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async me(@CurrentUser() user: UserPayloadDto): Promise<ApiAuthGetMeResponseDto> {
    return this.authService.me(user.sub);
  }
}
