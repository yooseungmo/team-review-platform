import {
  calcFinalStatus,
  canModifyEvent,
  canReadEvent,
  FinalStatus,
  initStatusesByReviewers,
  recalcStatusesOnReviewerChange,
  ReviewStatus,
  UserPayloadDto,
} from '@app/common';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiEventCommonResponseDto } from './dto/api-event-common-response.dto';
import { ApiEventGetQueryRequestDto } from './dto/api-event-get-query-request.dto';
import { ApiEventGetQueryResponseDto } from './dto/api-event-get-query-response.dto';
import { ApiEventPatchReviewersRequestDto } from './dto/api-event-patch-reviewers-request.dto';
import { ApiEventPatchUpdateRequestDto } from './dto/api-event-patch-update-request.dto';
import { ApiEventPostCreateRequestDto } from './dto/api-event-post-create-request.dto';
import { EventMongoRepository } from './event.mongo.repository';
import { GameEventDocument } from './schemas/event.schema';

@Injectable()
export class EventService {
  constructor(private readonly repository: EventMongoRepository) {}

  async create(
    user: UserPayloadDto,
    dto: ApiEventPostCreateRequestDto,
  ): Promise<ApiEventCommonResponseDto> {
    const ownerId = user.sub;
    const statuses = initStatusesByReviewers({
      pm: dto.plannerReviewerId ?? null,
      dev: dto.devReviewerId ?? null,
      qa: dto.qaReviewerId ?? null,
      cs: dto.csReviewerId ?? null,
    });

    const doc = await this.repository.create({
      name: dto.name,
      description: dto.description,
      ownerId,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      isConfidential: dto.isConfidential,
      plannerReviewerId: dto.plannerReviewerId ?? null,
      devReviewerId: dto.devReviewerId ?? null,
      qaReviewerId: dto.qaReviewerId ?? null,
      csReviewerId: dto.csReviewerId ?? null,
      ...statuses,
      finalStatus: calcFinalStatus(statuses),
    });

    return plainToInstance(ApiEventCommonResponseDto, doc, { excludeExtraneousValues: true });
  }

  async findAllVisibleTo(
    user: UserPayloadDto,
    q: ApiEventGetQueryRequestDto,
  ): Promise<ApiEventGetQueryResponseDto> {
    const { items, total } = await this.repository.findVisible(q, user);

    return {
      items: items.map((d) =>
        plainToInstance(ApiEventCommonResponseDto, d, { excludeExtraneousValues: true }),
      ),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async findOneVisibleTo(user: UserPayloadDto, id: string): Promise<ApiEventCommonResponseDto> {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (!canReadEvent(user, event)) throw new ForbiddenException('Access denied');

    return plainToInstance(ApiEventCommonResponseDto, event, { excludeExtraneousValues: true });
  }

  async updateByOwnerOrAdmin(
    user: UserPayloadDto,
    id: string,
    dto: ApiEventPatchUpdateRequestDto,
  ): Promise<ApiEventCommonResponseDto> {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (!canModifyEvent(user, event)) throw new ForbiddenException('Forbidden');

    // 리뷰어 변경 -> 상태 재계산
    const prevReviewers = {
      pm: event.plannerReviewerId ?? null,
      dev: event.devReviewerId ?? null,
      qa: event.qaReviewerId ?? null,
      cs: event.csReviewerId ?? null,
    };

    const reviewerChanges = {
      pm: dto.plannerReviewerId ?? event.plannerReviewerId,
      dev: dto.devReviewerId ?? event.devReviewerId,
      qa: dto.qaReviewerId ?? event.qaReviewerId,
      cs: dto.csReviewerId ?? event.csReviewerId,
    };

    const nextStatuses = recalcStatusesOnReviewerChange(
      {
        pmStatus: event.pmStatus,
        devStatus: event.devStatus,
        qaStatus: event.qaStatus,
        csStatus: event.csStatus,
      },
      prevReviewers,
      reviewerChanges,
    );

    const patch: any = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description && { description: dto.description }),
      ...(dto.startAt && { startAt: new Date(dto.startAt) }),
      ...(dto.endAt && { endAt: new Date(dto.endAt) }),
      ...(typeof dto.isConfidential === 'boolean' && { isConfidential: dto.isConfidential }),
      plannerReviewerId: reviewerChanges.pm ?? null,
      devReviewerId: reviewerChanges.dev ?? null,
      qaReviewerId: reviewerChanges.qa ?? null,
      csReviewerId: reviewerChanges.cs ?? null,
      ...nextStatuses,
    };

    Object.assign(patch, this.collectReviewedAtResets(event, nextStatuses));

    const finalStatus = calcFinalStatus(nextStatuses);
    patch.finalStatus = finalStatus;
    patch.approvedAt = this.resolveApprovedAt(event, finalStatus);

    const updated = await this.repository.updateById(id, patch, dto.v);
    if (!updated) throw new ConflictException('Version conflict or not found');

    return plainToInstance(ApiEventCommonResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async removeByOwnerOrAdmin(user: UserPayloadDto, id: string) {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (!canModifyEvent(user, event)) throw new ForbiddenException('Forbidden');

    await this.repository.deleteById(id);
    return { success: true };
  }

  async updateReviewers(user: UserPayloadDto, id: string, dto: ApiEventPatchReviewersRequestDto) {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (!canModifyEvent(user, event)) throw new ForbiddenException('Only ADMIN or owner(PLANNER)');

    const prevReviewers = {
      pm: event.plannerReviewerId ?? null,
      dev: event.devReviewerId ?? null,
      qa: event.qaReviewerId ?? null,
      cs: event.csReviewerId ?? null,
    };

    const nextReviewers = {
      pm: dto.plannerReviewerId ?? event.plannerReviewerId,
      dev: dto.devReviewerId ?? event.devReviewerId,
      qa: dto.qaReviewerId ?? event.qaReviewerId,
      cs: dto.csReviewerId ?? event.csReviewerId,
    };

    // 상태 자동 재계산(NOT_REQUIRED/PENDING 전환)
    const nextStatuses = recalcStatusesOnReviewerChange(
      {
        pmStatus: event.pmStatus,
        devStatus: event.devStatus,
        qaStatus: event.qaStatus,
        csStatus: event.csStatus,
      },
      prevReviewers,
      nextReviewers,
    );

    const nextFinal = calcFinalStatus(nextStatuses);
    const reviewedAtResets = this.collectReviewedAtResets(event, nextStatuses);
    const update = {
      $set: {
        plannerReviewerId: nextReviewers.pm ?? null,
        devReviewerId: nextReviewers.dev ?? null,
        qaReviewerId: nextReviewers.qa ?? null,
        csReviewerId: nextReviewers.cs ?? null,
        pmStatus: nextStatuses.pmStatus,
        devStatus: nextStatuses.devStatus,
        qaStatus: nextStatuses.qaStatus,
        csStatus: nextStatuses.csStatus,
        finalStatus: nextFinal,
        approvedAt: this.resolveApprovedAt(event, nextFinal),
        ...reviewedAtResets,
      },
    };

    const updated = await this.repository.atomicGuardedUpdateById(id, {}, update, dto.v);
    if (!updated) throw new ConflictException('Version conflict');

    return plainToInstance(ApiEventCommonResponseDto, updated, { excludeExtraneousValues: true });
  }

  private collectReviewedAtResets(
    event: GameEventDocument,
    next: {
      pmStatus: ReviewStatus;
      devStatus: ReviewStatus;
      qaStatus: ReviewStatus;
      csStatus: ReviewStatus;
    },
  ): Record<string, null> {
    const entries: Array<
      [keyof typeof next, 'pmReviewedAt' | 'devReviewedAt' | 'qaReviewedAt' | 'csReviewedAt']
    > = [
      ['pmStatus', 'pmReviewedAt'],
      ['devStatus', 'devReviewedAt'],
      ['qaStatus', 'qaReviewedAt'],
      ['csStatus', 'csReviewedAt'],
    ];

    return entries.reduce<Record<string, null>>((acc, [statusKey, reviewedAtKey]) => {
      const prevStatus = (event as any)[statusKey] as ReviewStatus;
      const nextStatus = next[statusKey];

      if (
        nextStatus !== prevStatus &&
        (nextStatus === ReviewStatus.PENDING || nextStatus === ReviewStatus.NOT_REQUIRED)
      ) {
        acc[reviewedAtKey] = null;
      }

      return acc;
    }, {});
  }

  private resolveApprovedAt(event: GameEventDocument, nextFinal: FinalStatus): Date | null {
    if (nextFinal === FinalStatus.APPROVED) {
      if (event.finalStatus === FinalStatus.APPROVED && event.approvedAt) {
        return event.approvedAt;
      }
      return new Date();
    }
    return null;
  }
}
