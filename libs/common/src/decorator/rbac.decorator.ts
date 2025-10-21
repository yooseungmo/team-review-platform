import { SetMetadata } from '@nestjs/common';
import { Role } from '..';

export const RBAC_KEY = 'rbac';
export const Rbac = (...roles: Role[]) => SetMetadata(RBAC_KEY, roles);
