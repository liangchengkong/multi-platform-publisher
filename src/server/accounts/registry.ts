import type { PlatformId } from '@/domain/publisher/model'
import { isBuiltInPlatformId } from '@/domain/platforms/builtin'
import { BilibiliAuthProvider } from './providers/bilibili.provider'
import { MockAuthProvider } from './providers/mock.provider'
import type { AccountAuthProvider } from './types'

export function getAccountAuthProvider(platformId: PlatformId): AccountAuthProvider {
  if (isBuiltInPlatformId(platformId) && platformId === 'bilibili') {
    return new BilibiliAuthProvider()
  }

  return new MockAuthProvider(platformId)
}
