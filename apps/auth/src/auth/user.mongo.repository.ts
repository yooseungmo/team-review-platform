import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty } from '../../../../libs/common/src';
import { User, UserDocument, UserModel } from '../user/schemas/user.schema';
import { ApiAuthPostRegisterRequestDto } from './dto/api-auth-post-register-request.dto';

@Injectable()
export class UserMongoRepository {
  constructor(@InjectModel(User.name) private userModel: UserModel) {}

  async createUser(dto: ApiAuthPostRegisterRequestDto): Promise<UserDocument> {
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
}
