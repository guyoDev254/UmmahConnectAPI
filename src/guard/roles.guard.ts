import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/enum/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required for this route, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get user from request (set by AuthGuard/JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user is attached, deny access
    if (!user || !user.role) {
      return false;
    }

    // Allow if user has one of the required roles OR is SUPERADMIN
    return requiredRoles.some(
      (role) => role === user.role || user.role === Role.SUPERADMIN,
    );
  }
}
