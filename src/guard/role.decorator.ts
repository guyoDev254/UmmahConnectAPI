import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enum/roles.enum';

export const UserRoles = (...roles: Role[]) => SetMetadata('roles', roles);