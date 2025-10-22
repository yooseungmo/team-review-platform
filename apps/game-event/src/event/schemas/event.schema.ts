// eslint-disable-next-line max-classes-per-file
import { FinalStatus, ReviewStatus, Team } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class ReviewHistory {
  @Prop({ type: String, enum: Object.values(Team), required: true })
  team: Team;

  @Prop({ type: String, required: true })
  reviewerId: string;

  @Prop({ type: String, enum: Object.values(ReviewStatus), required: true })
  prevStatus: ReviewStatus;

  @Prop({ type: String, enum: Object.values(ReviewStatus), required: true })
  nextStatus: ReviewStatus;

  @Prop({ type: String, default: '' })
  comment: string;

  @Prop({ type: Date, default: () => new Date() })
  changedAt: Date;
}

@Schema({ timestamps: true, versionKey: 'v' })
export class GameEvent {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) description: string;

  @Prop({ required: true, index: true }) ownerId: string;
  @Prop({ required: true }) startAt: Date;
  @Prop({ required: true }) endAt: Date;

  @Prop({ type: Boolean, default: false, index: true }) isConfidential: boolean;

  @Prop({ type: String, default: null }) plannerReviewerId: string | null;
  @Prop({ type: String, default: null }) devReviewerId: string | null;
  @Prop({ type: String, default: null }) qaReviewerId: string | null;
  @Prop({ type: String, default: null }) csReviewerId: string | null;

  @Prop({ type: String, enum: ReviewStatus, default: ReviewStatus.NOT_REQUIRED })
  pmStatus: ReviewStatus;

  @Prop({ type: String, enum: ReviewStatus, default: ReviewStatus.NOT_REQUIRED })
  devStatus: ReviewStatus;

  @Prop({ type: String, enum: ReviewStatus, default: ReviewStatus.NOT_REQUIRED })
  qaStatus: ReviewStatus;

  @Prop({ type: String, enum: ReviewStatus, default: ReviewStatus.NOT_REQUIRED })
  csStatus: ReviewStatus;

  @Prop({ type: Date, default: null }) pmReviewedAt?: Date | null;
  @Prop({ type: Date, default: null }) devReviewedAt?: Date | null;
  @Prop({ type: Date, default: null }) qaReviewedAt?: Date | null;
  @Prop({ type: Date, default: null }) csReviewedAt?: Date | null;

  @Prop({ type: String, enum: FinalStatus, default: FinalStatus.IN_PROGRESS })
  finalStatus: FinalStatus;

  @Prop({ type: Date, default: null }) approvedAt?: Date | null;
  @Prop({ type: [ReviewHistory], default: [] })
  reviewHistory: ReviewHistory[];
}

export type GameEventDocument = HydratedDocument<GameEvent>;
export const GameEventSchema = SchemaFactory.createForClass(GameEvent);

GameEventSchema.index({ createdAt: -1 });
GameEventSchema.index({ isConfidential: 1, createdAt: -1 });
GameEventSchema.index({ ownerId: 1, createdAt: -1 });
GameEventSchema.index({ finalStatus: 1, createdAt: -1 });
GameEventSchema.index({ plannerReviewerId: 1 });
GameEventSchema.index({ devReviewerId: 1 });
GameEventSchema.index({ qaReviewerId: 1 });
GameEventSchema.index({ csReviewerId: 1 });

// 날짜 유효성
GameEventSchema.pre<GameEventDocument>('save', function checkDates(next) {
  if (this.startAt > this.endAt) {
    return next(new Error('endAt must be after startAt'));
  }
  return next();
});

// 메서드: 히스토리 추가
GameEventSchema.method(
  'pushHistory',
  function pushHistory(this: GameEventDocument, entry: Omit<ReviewHistory, 'changedAt'>) {
    this.reviewHistory.push({ ...entry, changedAt: new Date() } as any);
  },
);

// 인스턴스 메서드 (상태 계산/승인 시각)
GameEventSchema.method('recalcFinal', function recalcFinal(this: GameEventDocument) {
  const statuses = [this.pmStatus, this.devStatus, this.qaStatus, this.csStatus].filter(
    (s) => s !== ReviewStatus.NOT_REQUIRED,
  );

  let final: FinalStatus = FinalStatus.IN_PROGRESS;
  if (statuses.some((s) => s === ReviewStatus.REJECTED)) final = FinalStatus.REJECTED;
  else if (statuses.length > 0 && statuses.every((s) => s === ReviewStatus.APPROVED))
    final = FinalStatus.APPROVED;

  this.finalStatus = final;
  this.approvedAt = final === FinalStatus.APPROVED ? new Date() : null;
});
