import { PterodactylAPI, Backup } from './pterodactyl-api.js';
export declare class BackupManager {
    private api;
    constructor(api: PterodactylAPI);
    createBackupWithRotation(serverId: string): Promise<{
        status: number;
        data: unknown;
    }>;
    /**
     * Waits for a backup to complete by polling its status at regular intervals
     * @param serverId - The ID of the server where the backup is being created
     * @param backupId - The ID of the backup to monitor
     * @param retryInterval - The interval in milliseconds between status checks (default: 5000ms)
     * @param maxRetries - Maximum number of retry attempts (default: 5 minutes worth of retries based on interval)
     * @returns A Promise that resolves to the completed Backup object
     * @throws Error if the backup does not complete within the maximum number of retries
     */
    waitForBackupCompletion(serverId: string, backupId: string, retryInterval?: number, maxRetries?: number): Promise<Backup>;
}
