import * as core from '@actions/core'
import { PterodactylAPI, Backup } from './pterodactyl-api.js'

export class BackupManager {
  constructor(private api: PterodactylAPI) {}

  async createBackupWithRotation(serverId: string) {
    try {
      const result = await this.api.createBackup(serverId)

      if (result.status === 400) {
        core.info('Backup limit reached, rotating oldest backup...')
        const backups = await this.api.listBackups(serverId)
        const oldestBackup = backups.data.sort(
          (a, b) =>
            new Date(a.attributes.created_at).getTime() -
            new Date(b.attributes.created_at).getTime()
        )[0]

        await this.api.deleteBackup(serverId, oldestBackup.attributes.uuid)
        return await this.api.createBackup(serverId)
      }

      return result
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create backup: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Waits for a backup to complete by polling its status at regular intervals
   * @param serverId - The ID of the server where the backup is being created
   * @param backupId - The ID of the backup to monitor
   * @param retryInterval - The interval in milliseconds between status checks (default: 5000ms)
   * @param maxRetries - Maximum number of retry attempts (default: 5 minutes worth of retries based on interval)
   * @returns A Promise that resolves to the completed Backup object
   * @throws Error if the backup does not complete within the maximum number of retries
   */
  async waitForBackupCompletion(
    serverId: string,
    backupId: string,
    retryInterval = 5000,
    maxRetries = (5 * 60 * 1000) / retryInterval
  ): Promise<Backup> {
    let tries = 0

    while (tries < maxRetries) {
      const status = await this.api.getBackupStatus(serverId, backupId)
      core.debug(`Backup status: ${JSON.stringify(status)}`)

      if (status.attributes.completed_at) {
        return status
      }

      core.debug(`Attempt ${tries + 1} of ${maxRetries}`)

      tries++
      await new Promise((resolve) => setTimeout(resolve, retryInterval))
    }

    const totalMs = maxRetries * retryInterval
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' })
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['day', 60 * 60 * 24 * 1000],
      ['hour', 60 * 60 * 1000],
      ['minute', 60 * 1000],
      ['second', 1000]
    ]

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unit = units.find(([_, ms]) => totalMs >= ms) || ['second', 1000]
    const value = Math.round(totalMs / unit[1])
    const timeString = rtf.format(value, unit[0])

    console.error(`Backup did not complete within ${timeString}`)
    throw new Error(`Backup did not complete within ${timeString}`)
  }
}
