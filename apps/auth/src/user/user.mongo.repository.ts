import { isEmpty, Role, Team } from '@app/common';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { ApiAuthPostRegisterRequestDto } from '../auth/dto/api-auth-post-register-request.dto';
import { ApiUserGetQueryRequestDto } from './dto/api-user-get-query-request.dto';
import { User, UserDocument, UserModel } from './schemas/user.schema';

@Injectable()
export class UserMongoRepository {
  constructor(@InjectModel(User.name) private userModel: UserModel) {}

  async createUser(
    dto: ApiAuthPostRegisterRequestDto & { team: Team | null },
  ): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: dto.email }).exec();
    if (exists) throw new ConflictException('Email already exists');
    return this.userModel.create(dto);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async setRefreshTokenHash(id: string, token: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (isEmpty(user)) return;

    await user.setRefreshToken(token); // 해시 적용
    await user.save();
  }

  async clearRefreshToken(id: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (isEmpty(user)) return;

    await user.clearRefreshToken();
    await user.save();
  }

  async findUsers(q: ApiUserGetQueryRequestDto): Promise<{ items: UserDocument[]; total: number }> {
    const { role, team, search, page, limit } = q;

    const filter: FilterQuery<UserDocument> = {};
    if (role) filter.role = role;
    if (team) filter.team = team;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async updateRoleTeam(id: string, role: Role, team: Team | null): Promise<UserDocument | null> {
    // runValidators 로 스키마의 team 필수 로직 재검증
    return this.userModel
      .findByIdAndUpdate(id, { role, team: team ?? null }, { new: true, runValidators: true })
      .exec();
  }

  async updateActive(id: string, isActive: boolean): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true })
      .exec();
  }
}
