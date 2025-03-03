import * as core from '@actions/core'
import { PterodactylAPI } from './pterodactyl-api.js'
import { BackupManager } from './backup-manager.js'

export async function run(): Promise<void> {
  try {
    const panelUrl = core.getInput('panel-url', { required: true })
    const serverId = core.getInput('server-id', { required: true })
    const apiKey = core.getInput('api-key', { required: true })

    const api = new PterodactylAPI(panelUrl, apiKey)
    const manager = new BackupManager(api)

    core.info('Creating backup...')
    const result = await manager.createBackupWithRotation(serverId)

    if (result.status !== 200) {
      throw new Error(`Failed to create backup: ${JSON.stringify(result.data)}`)
    }

    const backupId = result.data.attributes.uuid
    core.info(`Backup created with UUID: ${backupId}`)

    core.info('Waiting for backup completion...')
    await manager.waitForBackupCompletion(serverId, backupId)

    core.setOutput('backup-uuid', backupId)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
