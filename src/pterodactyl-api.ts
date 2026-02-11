import fetch from 'node-fetch'

export interface Backup {
  attributes: {
    uuid: string
    name: string
    ignored_files: string[]
    sha256_hash: string
    bytes: number
    created_at: string
    completed_at?: string
  }
}

export class PterodactylAPI {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly extraHeaders: Record<string, string>

  constructor(
    panelUrl: string,
    apiKey: string,
    extraHeaders: Record<string, string> = {}
  ) {
    this.baseUrl = panelUrl.replace(/\/$/, '')
    this.apiKey = apiKey
    this.extraHeaders = extraHeaders
  }

  async listBackups(serverId: string): Promise<{ data: Backup[] }> {
    const response = await fetch(
      `${this.baseUrl}/api/client/servers/${serverId}/backups`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          ...this.extraHeaders
        }
      }
    )
    return (await response.json()) as Promise<{ data: Backup[] }>
  }

  async createBackup(serverId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/client/servers/${serverId}/backups`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          ...this.extraHeaders
        }
      }
    )
    return { status: response.status, data: (await response.json()) as Backup }
  }

  async deleteBackup(serverId: string, backupId: string) {
    await fetch(
      `${this.baseUrl}/api/client/servers/${serverId}/backups/${backupId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          ...this.extraHeaders
        }
      }
    )
  }

  async getBackupStatus(serverId: string, backupId: string): Promise<Backup> {
    const response = await fetch(
      `${this.baseUrl}/api/client/servers/${serverId}/backups/${backupId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          ...this.extraHeaders
        }
      }
    )

    return (await response.json()) as Backup
  }
}
