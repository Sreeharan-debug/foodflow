"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let StatusGuard = class StatusGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { user } = request;
        if (!user) {
            return true;
        }
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new common_1.ForbiddenException('Your account has been blocked by an administrator');
        }
        if (user.role === client_1.Role.ADMIN) {
            const path = request.path || '';
            if (path.endsWith(`/users/${user.id}`)) {
                return true;
            }
            if (!user.restaurant) {
                throw new common_1.ForbiddenException('No restaurant associated with this admin. Please complete onboarding.');
            }
            const restStatus = user.restaurant.status;
            if (restStatus === client_1.AdminStatus.PENDING) {
                throw new common_1.ForbiddenException('Your vendor registration is pending approval from the platform owner.');
            }
            else if (restStatus === client_1.AdminStatus.REJECTED) {
                throw new common_1.ForbiddenException('Your vendor registration has been rejected.');
            }
            else if (restStatus === client_1.AdminStatus.SUSPENDED) {
                throw new common_1.ForbiddenException('Your vendor account has been suspended by the platform owner.');
            }
        }
        return true;
    }
};
exports.StatusGuard = StatusGuard;
exports.StatusGuard = StatusGuard = __decorate([
    (0, common_1.Injectable)()
], StatusGuard);
//# sourceMappingURL=status.guard.js.map