import { CurrentUser, Public, UserPayloadDto } from '@app/common';
import { JwtAuthGuard, RbacGuard } from '@app/common/guard';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
@UseGuards(JwtAuthGuard, RbacGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '사용자 등록' })
  @ApiBody({ type: ApiAuthPostRegisterRequestDto })
  @ApiResponse({ status: 201, type: ApiAuthPostRegisterResponseDto })
  register(@Body() dto: ApiAuthPostRegisterRequestDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: ApiAuthPostLoginRequestDto })
  @ApiResponse({ status: 200, type: ApiAuthPostLoginResponseDto })
  login(@Body() dto: ApiAuthPostLoginRequestDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '로그인 연장 (Access Token 재발급)' })
  @ApiBody({ type: ApiAuthPostRefreshRequestDto })
  @ApiResponse({ status: 200, type: ApiAuthPostRefreshResponseDto })
  async refresh(@Body() dto: ApiAuthPostRefreshRequestDto): Promise<ApiAuthPostRefreshResponseDto> {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, type: ApiAuthPostLogoutResponseDto })
  async logout(@CurrentUser() user: UserPayloadDto): Promise<ApiAuthPostLogoutResponseDto> {
    return this.authService.logout(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회(Access Token 검증)' })
  @ApiResponse({ status: 200, type: ApiAuthGetMeResponseDto })
  async me(@CurrentUser() user: UserPayloadDto): Promise<ApiAuthGetMeResponseDto> {
    return this.authService.me(user.sub);
  }
}
