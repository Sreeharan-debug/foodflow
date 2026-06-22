import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserStatus, Role, AdminStatus } from '@prisma/client';

@Injectable()
export class StatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    if (!user) {
      return true;
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked by an administrator');
    }

    // Check restaurant status for admins
    if (user.role === Role.ADMIN) {
      const path = request.path || '';
      // Allow fetching own profile so the vendor portal can display status
      if (path.endsWith(`/users/${user.id}`)) {
        return true;
      }

      if (!user.restaurant) {
        throw new ForbiddenException('No restaurant associated with this admin. Please complete onboarding.');
      }

      const restStatus = user.restaurant.status;
      if (restStatus === AdminStatus.PENDING) {
        throw new ForbiddenException('Your vendor registration is pending approval from the platform owner.');
      } else if (restStatus === AdminStatus.REJECTED) {
        throw new ForbiddenException('Your vendor registration has been rejected.');
      } else if (restStatus === AdminStatus.SUSPENDED) {
        throw new ForbiddenException('Your vendor account has been suspended by the platform owner.');
      }
    }

    return true;
  }
}
