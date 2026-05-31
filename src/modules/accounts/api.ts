import type { AuthUrlResult, PlatformAccountStatus } from '@/domain/accounts/model'
import type { PlatformId } from '@/domain/publisher/model'

async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T
  if (!response.ok && response.status !== 501) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return data
}

export async function getAccountsFromApi(): Promise<PlatformAccountStatus[]> {
  const response = await fetch('/api/accounts', {
    headers: { Accept: 'application/json' },
  })

  return readJsonOrThrow<PlatformAccountStatus[]>(response)
}

export async function createAuthUrlInApi(platformId: PlatformId): Promise<AuthUrlResult> {
  const response = await fetch(`/api/accounts/${platformId}/auth-url`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })

  return readJsonOrThrow<AuthUrlResult>(response)
}

export async function disconnectAccountInApi(platformId: PlatformId): Promise<PlatformAccountStatus> {
  const response = await fetch(`/api/accounts/${platformId}/disconnect`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })

  return readJsonOrThrow<PlatformAccountStatus>(response)
}
