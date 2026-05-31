import { defaultPlatforms } from '@/domain/publisher/platforms'
import type { AuthUrlResult, PlatformAccountStatus } from '@/domain/accounts/model'
import type { PlatformId } from '@/domain/publisher/model'
import type { PrismaClient } from '@/generated/prisma/client'
import type { AccountAuthProvider } from '../types'

export class MockAuthProvider implements AccountAuthProvider {
  readonly platformId: PlatformId

  constructor(platformId: PlatformId) {
    this.platformId = platformId
  }

  async getStatus(prisma: PrismaClient): Promise<PlatformAccountStatus> {
    const platform = await prisma.platform.findUnique({
      where: { name: this.platformId },
      include: { accounts: { take: 1, orderBy: { createdAt: 'asc' } } },
    })
    const fallback = defaultPlatforms.find((item) => item.id === this.platformId)
    const account = platform?.accounts[0]

    return {
      platformId: this.platformId,
      platformName: platform?.displayName ?? fallback?.displayName ?? this.platformId,
      accountId: account?.id,
      accountName: account?.accountName ?? `${fallback?.displayName ?? this.platformId}模拟账号`,
      authType: 'mock',
      status: account?.status === 'connected' ? 'connected' : 'unsupported',
      connected: account?.status === 'connected',
      supportsOAuth: false,
      message: '当前平台暂未接入真实授权，发布流程使用模拟账号。',
    }
  }

  async createAuthUrl(): Promise<AuthUrlResult> {
    return {
      platformId: this.platformId,
      supported: false,
      configured: false,
      message: '当前平台暂未支持真实 OAuth 授权。',
    }
  }

  async handleCallback(prisma: PrismaClient): Promise<PlatformAccountStatus> {
    return this.getStatus(prisma)
  }

  async disconnect(prisma: PrismaClient): Promise<PlatformAccountStatus> {
    return this.getStatus(prisma)
  }

  async refreshToken(prisma: PrismaClient): Promise<PlatformAccountStatus> {
    return this.getStatus(prisma)
  }
}
