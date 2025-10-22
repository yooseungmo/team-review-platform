/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
import { normalizeRoleTeamOrThrow, Role, Team } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import 'dotenv/config';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { User, UserDocument } from '../user/schemas/user.schema';

type SeedUser = {
  username: string;
  email: string;
  password: string;
  role: Role;
  team?: Team | null;
};

const USERS: SeedUser[] = [
  // ADMIN
  { username: 'Admin', email: 'admin@nexon.com', password: '123456', role: Role.ADMIN, team: null },
  // PLANNER (PM 고정)
  {
    username: 'Planner',
    email: 'planner@nexon.com',
    password: '123456',
    role: Role.PLANNER,
    team: Team.PM,
  },
  // REVIEWERs
  {
    username: 'Reviewer Dev',
    email: 'reviewer-dev@nexon.com',
    password: '123456',
    role: Role.REVIEWER,
    team: Team.DEV,
  },
  {
    username: 'Reviewer QA',
    email: 'reviewer-qa@nexon.com',
    password: '123456',
    role: Role.REVIEWER,
    team: Team.QA,
  },
  {
    username: 'Reviewer CS',
    email: 'reviewer-cs@nexon.com',
    password: '123456',
    role: Role.REVIEWER,
    team: Team.CS,
  },
  {
    username: 'Reviewer PM',
    email: 'reviewer-pm@nexon.com',
    password: '123456',
    role: Role.REVIEWER,
    team: Team.PM,
  },
  // VIEWER
  {
    username: 'Viewer',
    email: 'viewer@nexon.com',
    password: '123456',
    role: Role.VIEWER,
    team: null,
  },
];

async function upsertUser(UserModel: Model<UserDocument>, u: SeedUser) {
  // 규칙 정규화 (ADMIN/VIEWER → team=null, PLANNER → PM 고정, REVIEWER → 팀 필수)
  const normalizedTeam = normalizeRoleTeamOrThrow(u.role, u.team ?? null);

  const exists = await UserModel.findOne({ email: u.email }).exec();
  if (exists) {
    exists.role = u.role;
    exists.team = normalizedTeam;
    exists.isActive = true;
    await exists.save();
    // eslint-disable-next-line no-console
    console.log(
      `[seed] updated: ${u.email} (${u.role}${normalizedTeam ? `/${normalizedTeam}` : ''})`,
    );
  } else {
    await UserModel.create({
      username: u.username,
      email: u.email,
      password: u.password,
      role: u.role,
      team: normalizedTeam,
      isActive: true,
    });
    // eslint-disable-next-line no-console
    console.log(
      `[seed] created: ${u.email} (${u.role}${normalizedTeam ? `/${normalizedTeam}` : ''})`,
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  const UserModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  for (const u of USERS) {
    // eslint-disable-next-line no-await-in-loop
    await upsertUser(UserModel, u);
  }

  await app.close();
  process.exit(0);
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[seed] failed:', e);
  process.exit(1);
});
