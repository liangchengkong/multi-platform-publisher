import type { AuthUrlResult, PlatformAccountStatus } from '@/domain/accounts/model'
import type { PlatformId } from '@/domain/publisher/model'
import { prisma } from '@/lib/db'
import { getAccountAuthProvider } from './registry'

export function isPlatformId(value: string): value is PlatformId {
  return /^[a-z0-9-]+$/.test(value)
}

export async function listAccountStatuses(): Promise<PlatformAccountStatus[]> {
  const platforms = await prisma.platform.findMany({ orderBy: { createdAt: 'asc' } })
  return Promise.all(platforms.map((platform) => getAccountAuthProvider(platform.name).getStatus(prisma)))
}

export async function getAccountStatus(platformId: PlatformId): Promise<PlatformAccountStatus> {
  return getAccountAuthProvider(platformId).getStatus(prisma)
}

export async function createAccountAuthUrl(platformId: PlatformId): Promise<AuthUrlResult> {
  return getAccountAuthProvider(platformId).createAuthUrl()
}

export async function handleAccountOAuthCallback(input: {
  platformId: PlatformId
  code: string
  state?: string | null
  requestUrl: string
}): Promise<PlatformAccountStatus> {
  return getAccountAuthProvider(input.platformId).handleCallback(prisma, input)
}

export async function disconnectAccount(platformId: PlatformId): Promise<PlatformAccountStatus> {
  return getAccountAuthProvider(platformId).disconnect(prisma)
}
