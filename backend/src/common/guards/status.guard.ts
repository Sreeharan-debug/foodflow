import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

@Injectable()
export class StatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (user && user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked by an administrator');
    }
    return true;
  }
}
