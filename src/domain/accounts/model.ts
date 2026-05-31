import type { PlatformId } from '@/domain/publisher/model'

export type AccountAuthType = 'mock' | 'oauth'
export type AccountConnectionStatus = 'connected' | 'disconnected' | 'unsupported' | 'error'

export interface PlatformAccountStatus {
  platformId: PlatformId
  platformName: string
  accountId?: string
  accountName: string
  authType: AccountAuthType
  status: AccountConnectionStatus
  connected: boolean
  supportsOAuth: boolean
  expiresAt?: string
  message: string
}

export interface AuthUrlResult {
  platformId: PlatformId
  supported: boolean
  configured: boolean
  authUrl?: string
  message: string
}
