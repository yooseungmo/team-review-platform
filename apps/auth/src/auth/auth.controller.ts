import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../libs/common/src';
import { JwtAuthGuard, RbacGuard } from '../../../../libs/common/src/guard';
import { AuthService } from './auth.service';
import { ApiAuthPostLoginRequestDto } from './dto/api-auth-post-login-request.dto';
import { ApiAuthPostLoginResponseDto } from './dto/api-auth-post-login-response.dto';
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
}
