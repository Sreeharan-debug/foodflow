import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getAuditLogs(search?: string, entityType?: string, page?: string, limit?: string): Promise<{
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
