/* eslint-disable no-nested-ternary */
import {
  buildReviewAtomicUpdate,
  calcFinalStatus,
  canReadEvent,
  canReadReviewHistory,
  ReviewStatus,
  Role,
  Team,
  TeamKey,
  teamToKey,
  UserPayloadDto,
} from '@app/common';
import { assertTransition } from '@app/common/util/state-machine.util';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiEventGetReviewHistoryResponseDto } from './dto/api-event-get-review-history-response.dto';
import { ApiEventGetReviewStatusResponseDto } from './dto/api-event-get-review-status-response.dto';
import { ApiEventPatchReviewStatusRequestDto } from './dto/api-event-patch-review-status-request.dto';
import { EventMongoRepository } from './event.mongo.repository';
import { GameEventDocument } from './schemas/event.schema';

@Injectable()
export class ReviewService {
  constructor(private readonly repository: EventMongoRepository) {}

  async getStatus(user: UserPayloadDto, id: string) {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (!canReadEvent(user, event)) throw new ForbiddenException('Access denied');

    return plainToInstance(ApiEventGetReviewStatusResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }

  async getHistory(user: UserPayloadDto, id: string): Promise<ApiEventGetReviewHistoryResponseDto> {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (!canReadReviewHistory(user, event)) throw new ForbiddenException('Access denied');

    return plainToInstance(
      ApiEventGetReviewHistoryResponseDto,
      { id: event.id, items: event.reviewHistory ?? [] },
      { excludeExtraneousValues: true },
    );
  }

  async updateStatus(user: UserPayloadDto, id: string, dto: ApiEventPatchReviewStatusRequestDto) {
    const event = await this.requireEvent(id);
    const team = this.decideTeam(user, dto, event);
    const ctx = this.buildContext(event, team, user, dto);

    this.assertTransitionOr409(ctx.prevStatus, ctx.desiredStatus, user.role);

    if (ctx.prevStatus === ctx.desiredStatus) {
      return plainToInstance(ApiEventGetReviewStatusResponseDto, event, {
        excludeExtraneousValues: true,
      });
    }

    const next = this.computeNextSnapshot(event, ctx.key, ctx.desiredStatus);
    const now = new Date();
    const update = buildReviewAtomicUpdate(ctx, next, now);

    const updated = await this.repository.atomicGuardedUpdateById(id, ctx.guards, update, dto.v);
    if (!updated) throw new ConflictException('Version/state conflict: please refresh and retry.');

    return plainToInstance(ApiEventGetReviewStatusResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  private async requireEvent(id: string): Promise<GameEventDocument> {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  /** ADMIN: dto.team 필수 / REVIEWER: 배정 팀 자동추론 / 그 외: 금지 */
  private decideTeam(
    user: UserPayloadDto,
    dto: ApiEventPatchReviewStatusRequestDto,
    ev: GameEventDocument,
  ): Team {
    if (user.role === Role.ADMIN) {
      if (!dto.team) throw new BadRequestException('ADMIN은 team을 지정해야 합니다.');
      return dto.team;
    }
    if (user.role === Role.REVIEWER) {
      const t =
        ev.plannerReviewerId === user.sub
          ? Team.PM
          : ev.devReviewerId === user.sub
            ? Team.DEV
            : ev.qaReviewerId === user.sub
              ? Team.QA
              : ev.csReviewerId === user.sub
                ? Team.CS
                : null;
      if (!t) throw new ForbiddenException('배정된 리뷰 팀이 아닙니다.');
      if (dto.team && dto.team !== t) throw new ForbiddenException('본인 팀만 변경 가능');
      return t;
    }
    throw new ForbiddenException('REVIEWER 또는 ADMIN만 변경 가능합니다.');
  }

  private buildContext(
    ev: GameEventDocument,
    team: Team,
    user: UserPayloadDto,
    dto: ApiEventPatchReviewStatusRequestDto,
  ) {
    const key: TeamKey = teamToKey[team];
    const reviewedAtField =
      key === 'pm'
        ? 'pmReviewedAt'
        : key === 'dev'
          ? 'devReviewedAt'
          : key === 'qa'
            ? 'qaReviewedAt'
            : 'csReviewedAt';

    // reviewer 존재 체크
    const reviewerByTeam = {
      pm: ev.plannerReviewerId,
      dev: ev.devReviewerId,
      qa: ev.qaReviewerId,
      cs: ev.csReviewerId,
    } as const;
    if (!reviewerByTeam[key]) {
      throw new BadRequestException(`${team} 팀 리뷰어가 지정되어 있지 않습니다.`);
    }

    const prevStatusMap = {
      pm: ev.pmStatus,
      dev: ev.devStatus,
      qa: ev.qaStatus,
      cs: ev.csStatus,
    } as const;
    const prevStatus = prevStatusMap[key];
    const guards = { [`${key}Status`]: prevStatus } as Record<string, any>;

    return {
      key,
      team,
      reviewerId: user.sub,
      desiredStatus: dto.status,
      comment: dto.comment ?? '',
      reviewedAtField,
      prevStatus,
      guards,
    };
  }

  /** FSM 규칙 위반 -> 409 변환 */
  private assertTransitionOr409(prev: ReviewStatus, next: ReviewStatus, actor: Role) {
    try {
      assertTransition(prev, next, actor);
    } catch (e: any) {
      throw new ConflictException(e.message);
    }
  }

  /** 다음 상태 스냅샷 및 최종 상태 계산 */
  private computeNextSnapshot(ev: GameEventDocument, key: TeamKey, desired: ReviewStatus) {
    const next = {
      pmStatus: key === 'pm' ? desired : ev.pmStatus,
      devStatus: key === 'dev' ? desired : ev.devStatus,
      qaStatus: key === 'qa' ? desired : ev.qaStatus,
      csStatus: key === 'cs' ? desired : ev.csStatus,
    };
    const finalStatus = calcFinalStatus(next as any);
    const approvedAt = finalStatus === 'APPROVED' ? new Date() : null;
    return { next, finalStatus, approvedAt };
  }
}
