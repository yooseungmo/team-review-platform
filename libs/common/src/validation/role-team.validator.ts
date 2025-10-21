import { Role, Team } from '@app/common';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsValidRoleTeamPair(options?: ValidationOptions) {
  return function IsValidRoleTeam(object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidRoleTeamPair',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const o: any = args.object;
          const { role } = o;
          const team: Team | null | undefined = o.team ?? null;

          if (role === Role.ADMIN || role === Role.VIEWER) return team == null;
          if (role === Role.PLANNER) return team === Team.PM;
          if (role === Role.REVIEWER)
            return team != null && [Team.PM, Team.DEV, Team.QA, Team.CS].includes(team);
          return false;
        },
        defaultMessage() {
          return 'Invalid role/team combination';
        },
      },
    });
  };
}
