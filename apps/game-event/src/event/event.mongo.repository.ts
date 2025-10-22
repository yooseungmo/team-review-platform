import { Role, UserPayloadDto } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ApiEventGetQueryRequestDto } from './dto/api-event-get-query-request.dto';
import { GameEvent, GameEventDocument } from './schemas/event.schema';

@Injectable()
export class EventMongoRepository {
  constructor(@InjectModel(GameEvent.name) private model: Model<GameEventDocument>) {}

  create(doc: Partial<GameEvent>) {
    return this.model.create(doc);
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  async findVisible(q: ApiEventGetQueryRequestDto, user: UserPayloadDto) {
    const base: FilterQuery<GameEvent> = {};

    if (q.ownerId) base.ownerId = q.ownerId;
    if (q.finalStatus) base.finalStatus = q.finalStatus as any;
    if (q.isConfidential === 'true') base.isConfidential = true;
    if (q.isConfidential === 'false') base.isConfidential = false;

    if (q.startFrom || q.endTo) {
      base.startAt = {};
      if (q.startFrom) (base.startAt as any).$gte = new Date(q.startFrom);
      if (q.endTo) (base.startAt as any).$lte = new Date(q.endTo);
    }

    const acl = this.buildAccessFilter(user);
    const combined = this.andMerge<GameEvent>(base, acl);

    const skip = (q.page - 1) * q.limit;

    const [items, total] = await Promise.all([
      this.model.find(combined).sort({ createdAt: -1 }).skip(skip).limit(q.limit).exec(),
      this.model.countDocuments(combined).exec(),
    ]);
    return { items, total };
  }

  updateById(id: string, update: Partial<GameEvent>, expectedVersion?: number) {
    const query: any = { _id: id };
    if (typeof expectedVersion === 'number') query.v = expectedVersion;
    return this.model.findOneAndUpdate(query, update, { new: true, runValidators: true }).exec();
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  private buildAccessFilter(user: UserPayloadDto): FilterQuery<GameEvent> {
    if (user.role === Role.ADMIN) {
      return {};
    }

    const publicCondition = { isConfidential: false };

    if (user.role === Role.VIEWER) {
      return publicCondition;
    }
    if (user.role === Role.PLANNER) {
      return {
        $or: [publicCondition, { ownerId: user.sub }],
      };
    }
    if (user.role === Role.REVIEWER) {
      return {
        $or: [
          publicCondition,
          { plannerReviewerId: user.sub },
          { devReviewerId: user.sub },
          { qaReviewerId: user.sub },
          { csReviewerId: user.sub },
        ],
      };
    }

    return publicCondition;
  }

  private andMerge<T>(...parts: Array<FilterQuery<T>>): FilterQuery<T> {
    const xs = parts.filter((p) => p && Object.keys(p).length > 0);
    if (xs.length === 0) return {};
    if (xs.length === 1) return xs[0];
    return { $and: xs };
  }

  /**
   * 리뷰 갱신용: _id + (선택)가드 + (선택)버전(v)을 모두 만족해야 업데이트.
   * 성공 시 v를 +1 증분하여 다음 요청은 반드시 최신 v를 요구하게 함.
   */
  async atomicGuardedUpdateById(
    id: string,
    guards: FilterQuery<GameEvent>,
    update: UpdateQuery<GameEvent>,
    expectedVersion?: number,
  ) {
    const query: FilterQuery<GameEvent> = { _id: id, ...guards };
    if (typeof expectedVersion === 'number') (query as any).v = expectedVersion;

    const nextUpdate: UpdateQuery<GameEvent> = {
      $inc: { v: 1 },
      $currentDate: { updatedAt: true },
      ...update,
    };

    return this.model
      .findOneAndUpdate(query, nextUpdate, { new: true, runValidators: true })
      .exec();
  }
}
