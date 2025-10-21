import { Role, Team } from '@app/common';

export interface JwtPayload {
  sub: string; // user id
  role: Role;
  team: Team | null;
  iat?: number;
  exp?: number;
}
