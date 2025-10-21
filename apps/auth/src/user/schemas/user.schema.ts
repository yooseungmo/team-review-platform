/* eslint-disable unused-imports/no-unused-vars */
import { Role, Team } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  // 저장 전 pre-save 훅에서 해시
  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: Object.values(Role), default: Role.VIEWER })
  role: Role;

  @Prop({ type: String, enum: Object.values(Team), default: null })
  team?: Team | null;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  refreshTokenHash?: string | null;
}

export interface UserMethods {
  comparePassword(plain: string): Promise<boolean>;
  setRefreshToken(token: string): Promise<void>;
  clearRefreshToken(): void;
  compareRefreshToken(token: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<User, UserMethods>;
export type UserModel = Model<User, any, UserMethods>;

export const UserSchema = SchemaFactory.createForClass(User);

/** 비밀번호 자동 해시 */
UserSchema.pre<UserDocument>('save', async function hashPassword(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

/** Role/Team 조건 검증 
  ADMIN / VIEWER → team=null
  PLANNER → team=PM (고정)
  REVIEWER → team ∈ {PM, DEV, QA, CS} (필수 지정)
*/
UserSchema.path('team').validate(function validatePair(this: UserDocument, v: Team | null) {
  switch (this.role) {
    case Role.ADMIN:
    case Role.VIEWER:
      return v == null; // 금지
    case Role.PLANNER:
      return v === Team.PM; // PM 고정
    case Role.REVIEWER:
      return v != null && [Team.PM, Team.DEV, Team.QA, Team.CS].includes(v);
    default:
      return false;
  }
}, 'Invalid role/team combination');

/** 인스턴스 메서드 구현 */
UserSchema.method(
  'comparePassword',
  async function comparePasswordMethod(this: UserDocument, plain: string) {
    return bcrypt.compare(plain, this.password);
  },
);

UserSchema.method(
  'setRefreshToken',
  async function setRefreshTokenMethod(this: UserDocument, token: string) {
    const salt = await bcrypt.genSalt(10);
    this.refreshTokenHash = await bcrypt.hash(token, salt);
  },
);

UserSchema.method('clearRefreshToken', function clearRefreshTokenMethod(this: UserDocument) {
  this.refreshTokenHash = null;
});

UserSchema.method(
  'compareRefreshToken',
  async function compareRefreshTokenMethod(this: UserDocument, token: string) {
    if (!this.refreshTokenHash) return false;
    return bcrypt.compare(token, this.refreshTokenHash);
  },
);

/** 응답에서 민감정보 제거 */
UserSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    const { _id, password, refreshTokenHash, ...rest } = ret;
    return { ...rest, id: String(_id) };
  },
});
UserSchema.set('toObject', { virtuals: true });
