import { Role, Team } from '..';

export class UserPayloadDto {
  sub: string;
  email: string;
  role: Role;
  team?: Team;
}
