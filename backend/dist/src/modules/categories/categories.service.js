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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { foods: true },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async create(createCategoryDto, performedBy) {
        const existing = await this.prisma.category.findUnique({
            where: { name: createCategoryDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Category with name "${createCategoryDto.name}" already exists`);
        }
        const category = await this.prisma.category.create({
            data: createCategoryDto,
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'CREATE_CATEGORY',
                performedBy,
                entityType: 'CATEGORY',
                entityId: category.id,
            },
        });
        return category;
    }
    async update(id, updateCategoryDto, performedBy) {
        await this.findOne(id);
        if (updateCategoryDto.name) {
            const existing = await this.prisma.category.findFirst({
                where: {
                    name: updateCategoryDto.name,
                    NOT: { id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException(`Category with name "${updateCategoryDto.name}" already exists`);
            }
        }
        const category = await this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'UPDATE_CATEGORY',
                performedBy,
                entityType: 'CATEGORY',
                entityId: category.id,
            },
        });
        return category;
    }
    async remove(id, performedBy) {
        await this.findOne(id);
        await this.prisma.category.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: {
                action: 'DELETE_CATEGORY',
                performedBy,
                entityType: 'CATEGORY',
                entityId: id,
            },
        });
        return { message: 'Category deleted successfully' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map