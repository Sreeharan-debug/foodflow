import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        search?: string;
        entityType?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        logs: {
            id: string;
            action: string;
            performedBy: string;
            entityType: string;
            entityId: string | null;
            timestamp: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
