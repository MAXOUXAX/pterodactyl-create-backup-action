import * as core from '@actions/core'
import { PterodactylAPI } from './pterodactyl-api.js'
import { BackupManager } from './backup-manager.js'

function parseExtraHeaders(rawHeaders: string): Record<string, string> {
  const trimmed = rawHeaders.trim()
  if (!trimmed) return {}

  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(
          ([key, value]) => [key, String(value)]
        )
      )
    }

    throw new Error(
      'headers input must be a JSON object when using JSON format'
    )
  }

  const separator =
    trimmed.includes('\n') || trimmed.includes('\r') ? /\r?\n/ : /\s*,\s*/
  const lines = trimmed.split(separator)
  const headers: Record<string, string> = {}

  for (const line of lines) {
    if (!line.trim()) continue

    const delimiterIndex =
      line.indexOf(':') >= 0 ? line.indexOf(':') : line.indexOf('=')
    if (delimiterIndex === -1) {
      throw new Error(
        `Invalid headers input line "${line}". Use "Header: Value" or JSON object format.`
      )
    }

    const key = line.slice(0, delimiterIndex).trim()
    const value = line.slice(delimiterIndex + 1).trim()

    if (!key) {
      throw new Error(
        `Invalid headers input line "${line}". Header name cannot be empty.`
      )
    }

    headers[key] = value
  }

  return headers
}

export async function run(): Promise<void> {
  try {
    const panelUrl = core.getInput('panel-url', { required: true })
    const serverId = core.getInput('server-id', { required: true })
    const apiKey = core.getInput('api-key', { required: true })
    const rawHeaders = core.getInput('headers')
    const extraHeaders = parseExtraHeaders(rawHeaders)

    const api = new PterodactylAPI(panelUrl, apiKey, extraHeaders)
    const manager = new BackupManager(api)

    core.info('Creating backup...')
    const result = await manager.createBackupWithRotation(serverId)

    if (result.status < 200 || result.status >= 300) {
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
