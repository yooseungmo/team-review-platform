import { ReviewStatus, Team } from '@app/common';
import { UpdateQuery } from 'mongoose';
import { GameEvent } from '../../../../apps/game-event/src/event/schemas/event.schema';

type TeamKey = 'pm' | 'dev' | 'qa' | 'cs';

export interface ReviewUpdateContext {
  key: TeamKey;
  team: Team;
  reviewerId: string;
  desiredStatus: ReviewStatus;
  comment: string;
  reviewedAtField: string; // 'pmReviewedAt' | 'devReviewedAt' | ...
  prevStatus: ReviewStatus;
}

export interface NextSnapshot {
  finalStatus: string; // FinalStatus enum string
  approvedAt: Date | null;
}

/** 순수 빌더: Mongo Update 문서를 만들어 반환(부작용 없음) */
export function buildReviewAtomicUpdate(
  ctx: ReviewUpdateContext,
  snapshot: NextSnapshot,
  now: Date,
): UpdateQuery<GameEvent> {
  return {
    $set: {
      [`${ctx.key}Status`]: ctx.desiredStatus,
      [ctx.reviewedAtField]: now,
      finalStatus: snapshot.finalStatus,
      approvedAt: snapshot.approvedAt,
    },
    $push: {
      reviewHistory: {
        team: ctx.team,
        reviewerId: ctx.reviewerId,
        prevStatus: ctx.prevStatus,
        nextStatus: ctx.desiredStatus,
        comment: ctx.comment,
        changedAt: now,
      },
    },
  };
}
