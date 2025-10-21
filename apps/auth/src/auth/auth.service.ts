import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { JwtConfig } from '../../../../libs/common/src';
import { UserDocument } from '../user/schemas/user.schema';
import { ApiAuthPostLoginRequestDto } from './dto/api-auth-post-login-request.dto';
import { ApiAuthPostLoginResponseDto } from './dto/api-auth-post-login-response.dto';
import { ApiAuthPostRegisterRequestDto } from './dto/api-auth-post-register-request.dto';
import { ApiAuthPostRegisterResponseDto } from './dto/api-auth-post-register-response.dto';
import { UserMongoRepository } from './user.mongo.repository';

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
    if (!user?.isActive) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

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
}
