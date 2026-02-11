import fetch, { type Response } from 'node-fetch'
import * as core from '@actions/core'

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

  private async parseResponse<T>(response: Response): Promise<{
    data: T | unknown
    rawText?: string
    contentType: string
  }> {
    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()

    if (contentType.includes('application/json')) {
      try {
        return {
          data: JSON.parse(text) as T,
          contentType
        }
      } catch (error) {
        return {
          data: { parseError: (error as Error).message },
          rawText: text,
          contentType
        }
      }
    }

    return {
      data: text ? { rawText: text } : {},
      rawText: text,
      contentType
    }
  }

  private logResponseDebug(
    method: string,
    url: string,
    response: Response,
    contentType: string,
    rawText?: string
  ) {
    const headerKeys = Object.keys(this.extraHeaders)
    core.debug(
      `${method} ${url} -> ${response.status} ${response.statusText} (content-type: ${contentType || 'unknown'}, extra headers: ${headerKeys.join(', ') || 'none'})`
    )

    if (rawText && !contentType.includes('application/json')) {
      const snippet = rawText.slice(0, 500).replace(/\s+/g, ' ')
      core.debug(`Non-JSON response snippet: ${snippet}`)
    }
  }

  private formatResponseError(
    method: string,
    url: string,
    response: Response,
    contentType: string,
    rawText?: string
  ): string {
    const snippet = rawText
      ? rawText.slice(0, 500).replace(/\s+/g, ' ')
      : 'no body'
    return `${method} ${url} failed with status ${response.status} ${response.statusText} (content-type: ${contentType || 'unknown'}). Response: ${snippet}`
  }

  async listBackups(serverId: string): Promise<{ data: Backup[] }> {
    const url = `${this.baseUrl}/api/client/servers/${serverId}/backups`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        ...this.extraHeaders
      }
    })

    const parsed = await this.parseResponse<{ data: Backup[] }>(response)
    this.logResponseDebug(
      'GET',
      url,
      response,
      parsed.contentType,
      parsed.rawText
    )

    if (!response.ok) {
      throw new Error(
        this.formatResponseError(
          'GET',
          url,
          response,
          parsed.contentType,
          parsed.rawText
        )
      )
    }

    return parsed.data as { data: Backup[] }
  }

  async createBackup(serverId: string) {
    const url = `${this.baseUrl}/api/client/servers/${serverId}/backups`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        ...this.extraHeaders
      }
    })

    const parsed = await this.parseResponse<Backup>(response)
    this.logResponseDebug(
      'POST',
      url,
      response,
      parsed.contentType,
      parsed.rawText
    )

    return { status: response.status, data: parsed.data }
  }

  async deleteBackup(serverId: string, backupId: string) {
    const url = `${this.baseUrl}/api/client/servers/${serverId}/backups/${backupId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        ...this.extraHeaders
      }
    })

    const parsed = await this.parseResponse<unknown>(response)
    this.logResponseDebug(
      'DELETE',
      url,
      response,
      parsed.contentType,
      parsed.rawText
    )

    if (!response.ok) {
      throw new Error(
        this.formatResponseError(
          'DELETE',
          url,
          response,
          parsed.contentType,
          parsed.rawText
        )
      )
    }
  }

  async getBackupStatus(serverId: string, backupId: string): Promise<Backup> {
    const url = `${this.baseUrl}/api/client/servers/${serverId}/backups/${backupId}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        ...this.extraHeaders
      }
    })

    const parsed = await this.parseResponse<Backup>(response)
    this.logResponseDebug(
      'GET',
      url,
      response,
      parsed.contentType,
      parsed.rawText
    )

    if (!response.ok) {
      throw new Error(
        this.formatResponseError(
          'GET',
          url,
          response,
          parsed.contentType,
          parsed.rawText
        )
      )
    }

    return parsed.data as Backup
  }
}
