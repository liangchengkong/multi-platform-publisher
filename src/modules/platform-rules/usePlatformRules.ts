'use client'

import { useEffect, useState } from 'react'
import { defaultPlatforms } from '@/domain/platforms/builtin'
import type { PlatformDefinition } from '@/domain/publisher/model'
import type { PlatformInput } from '@/domain/platforms/model'
import { createPlatformInApi, deletePlatformInApi, getPlatformsFromApi, updatePlatformInApi } from './api'

type PlatformRulesStatus = 'idle' | 'saving' | 'saved' | 'error'

export function usePlatformRules() {
  const [platforms, setPlatforms] = useState<PlatformDefinition[]>(defaultPlatforms)
  const [status, setStatus] = useState<{ type: PlatformRulesStatus; message: string }>({
    type: 'idle',
    message: '平台规则从后端读取',
  })

  async function reload(showStatus = false) {
    if (showStatus) setStatus({ type: 'saving', message: '正在重新加载平台...' })
    try {
      const loaded = await getPlatformsFromApi()
      setPlatforms(loaded)
      if (showStatus) setStatus({ type: 'saved', message: '平台列表已更新' })
    } catch {
      setStatus({ type: 'error', message: '平台列表加载失败' })
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  function togglePlatformEnabled(platformId: string) {
    const currentPlatform = platforms.find((platform) => platform.id === platformId)
    if (!currentPlatform) return

    const nextEnabled = !currentPlatform.enabled
    setPlatforms((current) =>
      current.map((platform) =>
        platform.id === platformId ? { ...platform, enabled: nextEnabled } : platform,
      ),
    )

    void updatePlatformInApi(platformId, { enabled: nextEnabled })
      .then((updatedPlatform) => {
        setPlatforms((current) =>
          current.map((platform) =>
            platform.id === platformId ? updatedPlatform : platform,
          ),
        )
        setStatus({ type: 'saved', message: `${updatedPlatform.displayName} 已更新` })
      })
      .catch(() => {
        setPlatforms((current) =>
          current.map((platform) =>
            platform.id === platformId ? { ...platform, enabled: currentPlatform.enabled } : platform,
          ),
        )
        setStatus({ type: 'error', message: '平台状态保存失败' })
      })
  }

  async function createPlatform(input: PlatformInput) {
    setStatus({ type: 'saving', message: '正在创建自定义平台...' })
    try {
      const platform = await createPlatformInApi(input)
      setPlatforms((current) => [...current, platform])
      setStatus({ type: 'saved', message: `${platform.displayName} 已创建` })
    } catch {
      setStatus({ type: 'error', message: '自定义平台创建失败，请检查平台标识是否重复' })
    }
  }

  async function updatePlatform(platformId: string, input: PlatformInput) {
    setStatus({ type: 'saving', message: '正在保存平台配置...' })
    try {
      const platform = await updatePlatformInApi(platformId, input)
      setPlatforms((current) => current.map((item) => (item.id === platformId ? platform : item)))
      setStatus({ type: 'saved', message: `${platform.displayName} 已保存` })
    } catch {
      setStatus({ type: 'error', message: '平台配置保存失败' })
    }
  }

  async function deletePlatform(platformId: string) {
    const platform = platforms.find((item) => item.id === platformId)
    if (!platform || platform.source !== 'custom') return

    setStatus({ type: 'saving', message: '正在删除自定义平台...' })
    try {
      await deletePlatformInApi(platformId)
      setPlatforms((current) => current.filter((item) => item.id !== platformId))
      setStatus({ type: 'saved', message: `${platform.displayName} 已删除` })
    } catch {
      setStatus({ type: 'error', message: '自定义平台删除失败' })
    }
  }

  return {
    platforms,
    status,
    togglePlatformEnabled,
    createPlatform,
    updatePlatform,
    deletePlatform,
    resetAll: () => void reload(true),
  }
}
