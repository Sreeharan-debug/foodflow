"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                role: true,
                status: true,
                provider: true,
                profileImage: true,
                mustChangePassword: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                role: true,
                status: true,
                provider: true,
                profileImage: true,
                mustChangePassword: true,
                createdAt: true,
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async update(id, updateUserDto, performedBy) {
        const user = await this.findOne(id);
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                role: true,
                status: true,
                provider: true,
                profileImage: true,
                mustChangePassword: true,
            },
        });
        if (updateUserDto.status && updateUserDto.status !== user.status) {
            await this.prisma.auditLog.create({
                data: {
                    action: updateUserDto.status === 'BLOCKED' ? 'BLOCK_USER' : 'UNBLOCK_USER',
                    performedBy,
                    entityType: 'USER',
                    entityId: id,
                },
            });
        }
        return updatedUser;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
    async findAddresses(userId) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createAddress(userId, createAddressDto) {
        return this.prisma.address.create({
            data: {
                userId,
                ...createAddressDto,
            },
        });
    }
    async updateAddress(userId, addressId, updateAddressDto) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new common_1.NotFoundException(`Address not found`);
        }
        return this.prisma.address.update({
            where: { id: addressId },
            data: updateAddressDto,
        });
    }
    async removeAddress(userId, addressId) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new common_1.NotFoundException(`Address not found`);
        }
        await this.prisma.address.delete({
            where: { id: addressId },
        });
        return { message: 'Address removed successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map