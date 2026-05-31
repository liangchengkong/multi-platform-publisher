'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PlatformAccountStatus } from '@/domain/accounts/model'
import { adaptForAllPlatforms } from '@/domain/publisher/adapters'
import type { AdaptedContent, PlatformId, PublishRecord, SourceContent, WorkspaceState } from '@/domain/publisher/model'
import { findPlatform } from '@/domain/platforms/builtin'
import { createSeedWorkspace } from '@/domain/publisher/storage'
import { getAccountsFromApi } from '@/modules/accounts/api'
import {
  clearPublishRecordsInApi,
  getWorkspaceFromApi,
  publishSelectedInApi,
  resetWorkspaceInApi,
  updateAdaptedContentInApi,
  updateContentInApi,
} from './api'

type OperationStatusType = 'idle' | 'saving' | 'saved' | 'error' | 'publishing'

interface OperationStatus {
  type: OperationStatusType
  message: string
  updatedAt?: string
}

function mergeGeneratedAdapted(generated: Record<string, AdaptedContent>, current: Record<string, AdaptedContent>) {
  return Object.entries(generated).reduce(
    (result, [platformId, item]) => {
      result[platformId] = {
        ...item,
        id: current[platformId]?.id,
      }
      return result
    },
    {} as Record<string, AdaptedContent>,
  )
}

function updateSourceContent(state: WorkspaceState, nextSource: Pick<SourceContent, 'title' | 'body'>): WorkspaceState {
  const source = {
    ...state.source,
    ...nextSource,
    updatedAt: new Date().toISOString(),
  }
  return {
    ...state,
    source,
    adapted: mergeGeneratedAdapted(adaptForAllPlatforms(source, state.platforms), state.adapted),
  }
}

function toggleSelectedPlatformInState(state: WorkspaceState, platformId: PlatformId): WorkspaceState {
  const selected = state.selectedPlatformIds.includes(platformId)
    ? state.selectedPlatformIds.filter((id) => id !== platformId)
    : [...state.selectedPlatformIds, platformId]

  return {
    ...state,
    selectedPlatformIds: selected.filter((id) => findPlatform(state.platforms, id)?.enabled),
  }
}

function resolveActivePlatformId(state: WorkspaceState, activePlatformId: PlatformId) {
  const activePlatform = findPlatform(state.platforms, activePlatformId)
  if (activePlatform?.enabled) return activePlatformId
  return state.platforms.find((platform) => platform.enabled)?.id ?? state.platforms[0]?.id ?? 'wechat'
}

function updateAdaptedContentInState(
  state: WorkspaceState,
  platformId: PlatformId,
  patch: Pick<AdaptedContent, 'title' | 'body'>,
): WorkspaceState {
  return {
    ...state,
    adapted: {
      ...state.adapted,
      [platformId]: {
        ...state.adapted[platformId],
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    },
  }
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(() => createSeedWorkspace())
  const [activePlatformId, setActivePlatformId] = useState<PlatformId>('wechat')
  const [isPublishing, setIsPublishing] = useState(false)
  const [operationStatus, setOperationStatus] = useState<OperationStatus>({
    type: 'idle',
    message: '已连接后端数据',
  })
  const [accountStatuses, setAccountStatuses] = useState<PlatformAccountStatus[]>([])
  const [saveRevision, setSaveRevision] = useState(0)
  const [adaptedSaveRevision, setAdaptedSaveRevision] = useState(0)
  const [syncRevision, setSyncRevision] = useState(0)
  const [hasLocalEdits, setHasLocalEdits] = useState(false)

  useEffect(() => {
    const isManualSync = syncRevision > 0
    let cancelled = false

    const timer = window.setTimeout(() => {
      if (isManualSync) {
        setOperationStatus({ type: 'saving', message: '正在同步后端数据...' })
      }

      void getWorkspaceFromApi()
        .then((loaded) => {
          if (cancelled) return
          setState(loaded)
          setActivePlatformId((active) => resolveActivePlatformId(loaded, active))

          if (isManualSync) {
            setOperationStatus({
              type: 'saved',
              message: '已同步最新后端数据',
              updatedAt: new Date().toISOString(),
            })
          }
        })
        .catch(() => {
          if (cancelled || !isManualSync) return
          setOperationStatus({
            type: 'error',
            message: '同步后端数据失败，请稍后重试',
            updatedAt: new Date().toISOString(),
          })
        })
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [syncRevision])

  useEffect(() => {
    function refreshFromBackend() {
      if (!hasLocalEdits) {
        setSyncRevision((revision) => revision + 1)
      }
      void getAccountsFromApi().then(setAccountStatuses).catch(() => undefined)
    }

    window.addEventListener('focus', refreshFromBackend)
    window.addEventListener('pageshow', refreshFromBackend)

    return () => {
      window.removeEventListener('focus', refreshFromBackend)
      window.removeEventListener('pageshow', refreshFromBackend)
    }
  }, [hasLocalEdits])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getAccountsFromApi().then(setAccountStatuses).catch(() => undefined)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const enabledPlatforms = useMemo(() => state.platforms.filter((platform) => platform.enabled), [state.platforms])

  useEffect(() => {
    if (saveRevision === 0) return

    const timer = window.setTimeout(() => {
      setOperationStatus({ type: 'saving', message: '正在保存原文并重新生成适配内容...' })
      void updateContentInApi(state.source.id, {
        title: state.source.title,
        body: state.source.body,
      })
        .then(() => getWorkspaceFromApi())
        .then((workspace) => {
          setState(workspace)
          setActivePlatformId((active) => resolveActivePlatformId(workspace, active))
          setHasLocalEdits(false)
          setOperationStatus({
            type: 'saved',
            message: '原文和适配内容已同步',
            updatedAt: new Date().toISOString(),
          })
        })
        .catch(() => {
          setOperationStatus({
            type: 'error',
            message: '原文保存失败，请稍后重试',
            updatedAt: new Date().toISOString(),
          })
        })
    }, 500)

    return () => window.clearTimeout(timer)
  }, [saveRevision, state.source.body, state.source.id, state.source.title])

  useEffect(() => {
    if (adaptedSaveRevision === 0) return

    const activeAdapted = state.adapted[activePlatformId]
    if (!activeAdapted.id) return
    const adaptedContentId = activeAdapted.id

    const timer = window.setTimeout(() => {
      setOperationStatus({ type: 'saving', message: '正在保存平台适配内容...' })
      void updateAdaptedContentInApi(adaptedContentId, {
        title: activeAdapted.title,
        body: activeAdapted.body,
      })
        .then(() => {
          setHasLocalEdits(false)
          setOperationStatus({
            type: 'saved',
            message: '平台适配内容已保存',
            updatedAt: new Date().toISOString(),
          })
        })
        .catch(() => {
          setOperationStatus({
            type: 'error',
            message: '平台适配内容保存失败，请稍后重试',
            updatedAt: new Date().toISOString(),
          })
        })
    }, 500)

    return () => window.clearTimeout(timer)
  }, [activePlatformId, adaptedSaveRevision, state.adapted])

  function updateSource(nextSource: Pick<SourceContent, 'title' | 'body'>) {
    setState((current) => updateSourceContent(current, nextSource))
    setHasLocalEdits(true)
    setOperationStatus({ type: 'saving', message: '等待保存原文...' })
    setSaveRevision((revision) => revision + 1)
  }

  function toggleSelectedPlatform(platformId: PlatformId) {
    setState((current) => toggleSelectedPlatformInState(current, platformId))
    setActivePlatformId(platformId)
  }

  function updateAdaptedContent(platformId: PlatformId, patch: Pick<AdaptedContent, 'title' | 'body'>) {
    setState((current) => updateAdaptedContentInState(current, platformId, patch))
    setHasLocalEdits(true)
    setOperationStatus({ type: 'saving', message: '等待保存平台适配内容...' })
    setAdaptedSaveRevision((revision) => revision + 1)
  }

  async function publishSelected() {
    if (state.selectedPlatformIds.length === 0) return
    setIsPublishing(true)
    setOperationStatus({ type: 'publishing', message: '正在模拟发布...' })

    try {
      const records: PublishRecord[] = await publishSelectedInApi(state.source.id, state.selectedPlatformIds)

      setState((current) => ({
        ...current,
        records: [...records, ...current.records].slice(0, 30),
      }))
      setOperationStatus({
        type: 'saved',
        message: `模拟发布完成，生成 ${records.length} 条记录`,
        updatedAt: new Date().toISOString(),
      })
    } catch {
      setOperationStatus({
        type: 'error',
        message: '模拟发布失败，请检查后端接口',
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setIsPublishing(false)
    }
  }

  async function clearRecords() {
    setOperationStatus({ type: 'saving', message: '正在清空发布记录...' })
    try {
      await clearPublishRecordsInApi(state.source.id)
      setState((current) => ({ ...current, records: [] }))
      setOperationStatus({
        type: 'saved',
        message: '发布记录已清空',
        updatedAt: new Date().toISOString(),
      })
    } catch {
      setOperationStatus({
        type: 'error',
        message: '发布记录清空失败，请稍后重试',
        updatedAt: new Date().toISOString(),
      })
    }
  }

  function resetAll() {
    setOperationStatus({ type: 'saving', message: '正在格式化后端数据...' })
    void resetWorkspaceInApi()
      .then((workspace) => {
        setState(workspace)
        setActivePlatformId(resolveActivePlatformId(workspace, activePlatformId))
        setHasLocalEdits(false)
        setOperationStatus({
          type: 'saved',
          message: '后端数据已恢复为默认数据',
          updatedAt: new Date().toISOString(),
        })
      })
      .catch(() => {
        setOperationStatus({
          type: 'error',
          message: '格式化数据失败，请稍后重试',
          updatedAt: new Date().toISOString(),
        })
      })
  }

  return {
    state,
    enabledPlatforms,
    activePlatformId,
    activePlatform: findPlatform(state.platforms, activePlatformId),
    activeAdapted: state.adapted[activePlatformId],
    accountStatuses,
    operationStatus,
    setActivePlatformId,
    isPublishing,
    updateSource,
    toggleSelectedPlatform,
    updateAdaptedContent,
    publishSelected,
    clearRecords,
    resetAll,
  }
}
