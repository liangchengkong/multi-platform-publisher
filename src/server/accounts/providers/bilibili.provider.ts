import type { AuthUrlResult, PlatformAccountStatus } from '@/domain/accounts/model'
import type { PrismaClient } from '@/generated/prisma/client'
import { encryptToken } from '../crypto'
import type { AccountAuthProvider, OAuthCallbackInput } from '../types'

interface BilibiliTokenResponse {
  code?: number
  message?: string
  access_token?: string
  refresh_token?: string
  expires_in?: number
  data?: {
    access_token?: string
    refresh_token?: string
    expires_in?: number
  }
}

const AUTHORIZE_URL = 'https://api.bilibili.com/oauth2/authorize'
const TOKEN_URL = 'https://api.bilibili.com/oauth2/token'

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

function getBilibiliConfig() {
  return {
    clientId: process.env.BILIBILI_CLIENT_ID,
    clientSecret: process.env.BILIBILI_CLIENT_SECRET,
    redirectUri: `${getAppUrl()}/api/auth/bilibili/callback`,
  }
}

function readTokenData(data: BilibiliTokenResponse) {
  return {
    accessToken: data.access_token ?? data.data?.access_token,
    refreshToken: data.refresh_token ?? data.data?.refresh_token,
    expiresIn: data.expires_in ?? data.data?.expires_in,
  }
}

export class BilibiliAuthProvider implements AccountAuthProvider {
  readonly platformId = 'bilibili' as const

  async getStatus(prisma: PrismaClient): Promise<PlatformAccountStatus> {
    const platform = await prisma.platform.findUnique({
      where: { name: this.platformId },
      include: { accounts: { take: 1, orderBy: { updatedAt: 'desc' } } },
    })
    const account = platform?.accounts[0]
    const connected = account?.status === 'connected' && !!account.accessTokenEncrypted

    return {
      platformId: this.platformId,
      platformName: platform?.displayName ?? 'B站专栏',
      accountId: account?.id,
      accountName: account?.accountName ?? 'B站账号',
      authType: account?.authType === 'oauth' ? 'oauth' : 'mock',
      status: connected ? 'connected' : 'disconnected',
      connected,
      supportsOAuth: true,
      expiresAt: account?.tokenExpiresAt?.toISOString(),
      message: connected ? 'B站账号已完成真实 OAuth 授权。' : 'B站支持真实 OAuth 授权，当前未连接。',
    }
  }

  async createAuthUrl(): Promise<AuthUrlResult> {
    const config = getBilibiliConfig()

    if (!config.clientId || !config.clientSecret) {
      return {
        platformId: this.platformId,
        supported: true,
        configured: false,
        message: '缺少 BILIBILI_CLIENT_ID 或 BILIBILI_CLIENT_SECRET，无法生成授权链接。',
      }
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'content',
      state: this.platformId,
    })

    return {
      platformId: this.platformId,
      supported: true,
      configured: true,
      authUrl: `${AUTHORIZE_URL}?${params.toString()}`,
      message: '已生成 B站授权链接。',
    }
  }

  async handleCallback(prisma: PrismaClient, input: OAuthCallbackInput): Promise<PlatformAccountStatus> {
    const config = getBilibiliConfig()

    if (!config.clientId || !config.clientSecret) {
      throw new Error('Bilibili OAuth environment variables are missing')
    }

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: input.code,
        redirect_uri: config.redirectUri,
      }),
    })
    const data = (await response.json()) as BilibiliTokenResponse
    const tokenData = readTokenData(data)

    if (!response.ok || data.code !== 0 || !tokenData.accessToken) {
      throw new Error(data.message || 'Failed to exchange Bilibili authorization code')
    }

    const platform = await prisma.platform.findUnique({
      where: { name: this.platformId },
    })

    if (!platform) {
      throw new Error('Bilibili platform is not initialized')
    }

    const expiresAt = tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : null

    await prisma.platformAccount.upsert({
      where: { id: `account_${this.platformId}_oauth` },
      create: {
        id: `account_${this.platformId}_oauth`,
        platformId: platform.id,
        accountName: 'B站 OAuth 账号',
        authType: 'oauth',
        status: 'connected',
        accessTokenEncrypted: encryptToken(tokenData.accessToken),
        refreshTokenEncrypted: encryptToken(tokenData.refreshToken),
        tokenExpiresAt: expiresAt,
        configEncrypted: JSON.stringify({ mode: 'oauth' }),
      },
      update: {
        platformId: platform.id,
        accountName: 'B站 OAuth 账号',
        authType: 'oauth',
        status: 'connected',
        accessTokenEncrypted: encryptToken(tokenData.accessToken),
        refreshTokenEncrypted: encryptToken(tokenData.refreshToken),
        tokenExpiresAt: expiresAt,
        configEncrypted: JSON.stringify({ mode: 'oauth' }),
      },
    })

    return this.getStatus(prisma)
  }

  async disconnect(prisma: PrismaClient): Promise<PlatformAccountStatus> {
    const platform = await prisma.platform.findUnique({
      where: { name: this.platformId },
    })

    if (platform) {
      await prisma.platformAccount.upsert({
        where: { id: `account_${this.platformId}_oauth` },
        create: {
          id: `account_${this.platformId}_oauth`,
          platformId: platform.id,
          accountName: 'B站 OAuth 账号',
          authType: 'oauth',
          status: 'disconnected',
          configEncrypted: JSON.stringify({ mode: 'oauth' }),
        },
        update: {
          status: 'disconnected',
          accessTokenEncrypted: null,
          refreshTokenEncrypted: null,
          tokenExpiresAt: null,
        },
      })
    }

    return this.getStatus(prisma)
  }

  async refreshToken(prisma: PrismaClient): Promise<PlatformAccountStatus> {
    return this.getStatus(prisma)
  }
}
