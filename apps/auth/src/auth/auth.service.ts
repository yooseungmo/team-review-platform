import { JwtConfig } from '@app/common';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UserDocument } from '../user/schemas/user.schema';
import { UserMongoRepository } from '../user/user.mongo.repository';
import { ApiAuthGetMeResponseDto } from './dto/api-auth-get-me-response.dto';
import { ApiAuthPostLoginRequestDto } from './dto/api-auth-post-login-request.dto';
import { ApiAuthPostLoginResponseDto } from './dto/api-auth-post-login-response.dto';
import { ApiAuthPostLogoutResponseDto } from './dto/api-auth-post-logout-response.dto';
import { ApiAuthPostRefreshRequestDto } from './dto/api-auth-post-refresh-request.dto';
import { ApiAuthPostRefreshResponseDto } from './dto/api-auth-post-refresh-response.dto';
import { ApiAuthPostRegisterRequestDto } from './dto/api-auth-post-register-request.dto';
import { ApiAuthPostRegisterResponseDto } from './dto/api-auth-post-register-response.dto';

@Injectable()
export class AuthService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly repository: UserMongoRepository,
    private readonly jwt: JwtService,
    configService: ConfigService,
  ) {
    this.jwtConfig = new JwtConfig(configService);
  }

  async register(dto: ApiAuthPostRegisterRequestDto): Promise<ApiAuthPostRegisterResponseDto> {
    try {
      const user: UserDocument = await this.repository.createUser(dto);

      return plainToInstance(ApiAuthPostRegisterResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  async login(dto: ApiAuthPostLoginRequestDto): Promise<ApiAuthPostLoginResponseDto> {
    const user = await this.repository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const isValid = await user.comparePassword(dto.password);
    if (!isValid) throw new UnauthorizedException('Password is mismatch');

    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      team: user.team ?? null,
    };
    const refreshPayload = { sub: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, this.jwtConfig.access),
      this.jwt.signAsync(refreshPayload, this.jwtConfig.refresh),
    ]);

    await this.repository.setRefreshTokenHash(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(dto: ApiAuthPostRefreshRequestDto): Promise<ApiAuthPostRefreshResponseDto> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(dto.refreshToken, {
        secret: this.jwtConfig.refresh.secret,
      });

      const user = await this.repository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      const isValid = await user.compareRefreshToken(dto.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token mismatch');
      }

      const accessPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        team: user.team ?? null,
      };

      const accessToken = await this.jwt.signAsync(accessPayload, this.jwtConfig.access);

      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired. Please login again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token format');
      }
      // 예상치 못한 에러는 로깅하고 일반적인 메시지 반환
      // this.logger.error('Unexpected error during token refresh', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async logout(userId: string): Promise<ApiAuthPostLogoutResponseDto> {
    const user = await this.repository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    await this.repository.clearRefreshToken(userId);
    return { success: true };
  }

  async me(userId: string): Promise<ApiAuthGetMeResponseDto> {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return plainToInstance(ApiAuthGetMeResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
