import {
  calcFinalStatus,
  canModifyEvent,
  canReadEvent,
  initStatusesByReviewers,
  recalcStatusesOnReviewerChange,
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
import { ApiEventPatchUpdateRequestDto } from './dto/api-event-patch-update-request.dto';
import { ApiEventPostCreateRequestDto } from './dto/api-event-post-create-request.dto';
import { EventMongoRepository } from './event.mongo.repository';

@Injectable()
export class EventService {
  constructor(private readonly repository: EventMongoRepository) {}

  async create(
    user: UserPayloadDto,
    dto: ApiEventPostCreateRequestDto,
  ): Promise<ApiEventCommonResponseDto> {
    const ownerId = user.role;
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

    patch.finalStatus = calcFinalStatus(patch);

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

  // private toJSON(doc: any) {
  //   const { _id, ...rest } = doc.toObject({ versionKey: false });
  //   return { id: String(_id), ...rest };
  // }
}
