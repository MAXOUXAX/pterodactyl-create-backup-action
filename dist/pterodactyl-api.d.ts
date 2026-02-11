export interface Backup {
    attributes: {
        uuid: string;
        name: string;
        ignored_files: string[];
        sha256_hash: string;
        bytes: number;
        created_at: string;
        completed_at?: string;
    };
}
export declare class PterodactylAPI {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly extraHeaders;
    constructor(panelUrl: string, apiKey: string, extraHeaders?: Record<string, string>);
    private parseResponse;
    private logResponseDebug;
    private formatResponseError;
    listBackups(serverId: string): Promise<{
        data: Backup[];
    }>;
    createBackup(serverId: string): Promise<{
        status: number;
        data: unknown;
    }>;
    deleteBackup(serverId: string, backupId: string): Promise<void>;
    getBackupStatus(serverId: string, backupId: string): Promise<Backup>;
}
