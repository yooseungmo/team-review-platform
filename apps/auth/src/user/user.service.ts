import { JwtConfig, normalizeRoleTeamOrThrow } from '@app/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { ApiUserGetByIdResponseDto } from './dto/api-user-get-by-id-response.dto';
import { ApiUserGetQueryRequestDto } from './dto/api-user-get-query-request.dto';
import { ApiUserGetQueryResponseDto } from './dto/api-user-get-query-response.dto';
import { ApiUserPatchRoleTeamRequestDto } from './dto/api-user-patch-role-team-request.dto';
import { ApiUserPatchRoleTeamResponseDto } from './dto/api-user-patch-role-team-response.dto';
import { ApiUserPatchStatusRequestDto } from './dto/api-user-patch-status-request.dto';
import { ApiUserPatchStatusResponseDto } from './dto/api-user-patch-status-response.dto';
import { ApiUserSummaryDto } from './dto/user-summary.dto';
import { UserMongoRepository } from './user.mongo.repository';

@Injectable()
export class UserService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly repository: UserMongoRepository,
    private readonly jwt: JwtService,
    configService: ConfigService,
  ) {
    this.jwtConfig = new JwtConfig(configService);
  }

  async getUserById(id: string): Promise<ApiUserGetByIdResponseDto> {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return plainToInstance(ApiUserGetByIdResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async listUsers(q: ApiUserGetQueryRequestDto): Promise<ApiUserGetQueryResponseDto> {
    const { items, total } = await this.repository.findUsers(q);
    return {
      items: items.map((u) =>
        plainToInstance(ApiUserSummaryDto, u, { excludeExtraneousValues: true }),
      ),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async updateUserRoleTeam(
    id: string,
    dto: ApiUserPatchRoleTeamRequestDto,
  ): Promise<ApiUserPatchRoleTeamResponseDto> {
    /** Role-Team 규칙에 따라 팀을 검증·정규화 */
    const normalizedTeam = normalizeRoleTeamOrThrow(dto.role, dto.team ?? null);

    const updated = await this.repository.updateRoleTeam(id, dto.role, normalizedTeam);
    if (!updated) throw new NotFoundException('User not found');

    return plainToInstance(ApiUserPatchRoleTeamResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async updateUserStatus(
    id: string,
    dto: ApiUserPatchStatusRequestDto,
  ): Promise<ApiUserPatchStatusResponseDto> {
    const updated = await this.repository.updateActive(id, dto.isActive);
    if (!updated) throw new NotFoundException('User not found');

    return plainToInstance(ApiUserPatchStatusResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
}
