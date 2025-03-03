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
    constructor(panelUrl: string, apiKey: string);
    listBackups(serverId: string): Promise<{
        data: Backup[];
    }>;
    createBackup(serverId: string): Promise<{
        status: number;
        data: Backup;
    }>;
    deleteBackup(serverId: string, backupId: string): Promise<void>;
    getBackupStatus(serverId: string, backupId: string): Promise<Backup>;
}
