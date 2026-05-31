import type { AuthUrlResult, PlatformAccountStatus } from '@/domain/accounts/model'
import type { PlatformId } from '@/domain/publisher/model'
import type { PrismaClient } from '@/generated/prisma/client'

export interface OAuthCallbackInput {
  code: string
  state?: string | null
  requestUrl: string
}

export interface AccountAuthProvider {
  readonly platformId: PlatformId

  getStatus(prisma: PrismaClient): Promise<PlatformAccountStatus>
  createAuthUrl(): Promise<AuthUrlResult>
  handleCallback(prisma: PrismaClient, input: OAuthCallbackInput): Promise<PlatformAccountStatus>
  disconnect(prisma: PrismaClient): Promise<PlatformAccountStatus>
  refreshToken(prisma: PrismaClient): Promise<PlatformAccountStatus>
}
