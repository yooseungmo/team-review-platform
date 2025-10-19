import { Role } from '@app/common';
import { SetMetadata } from '@nestjs/common';

export const RBAC_KEY = 'rbac';
export const Rbac = (...roles: Role[]) => SetMetadata(RBAC_KEY, roles);
