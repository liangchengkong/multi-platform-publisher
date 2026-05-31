'use client'

import { useEffect, useState } from 'react'
import type { PlatformAccountStatus } from '@/domain/accounts/model'
import type { PlatformId } from '@/domain/publisher/model'
import { createAuthUrlInApi, disconnectAccountInApi, getAccountsFromApi } from './api'

type AccountOperationType = 'idle' | 'loading' | 'success' | 'error'

interface AccountOperationStatus {
  type: AccountOperationType
  message: string
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<PlatformAccountStatus[]>([])
  const [operationStatus, setOperationStatus] = useState<AccountOperationStatus>({
    type: 'idle',
    message: '账号状态从后端读取',
  })

  async function loadAccounts(showStatus = false) {
    if (showStatus) {
      setOperationStatus({ type: 'loading', message: '正在刷新账号状态...' })
    }

    try {
      const loaded = await getAccountsFromApi()
      setAccounts(loaded)
      if (showStatus) {
        setOperationStatus({ type: 'success', message: '账号状态已刷新' })
      }
    } catch {
      setOperationStatus({ type: 'error', message: '账号状态加载失败，请检查后端接口' })
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getAccountsFromApi()
        .then(setAccounts)
        .catch(() => {
          setOperationStatus({ type: 'error', message: '账号状态加载失败，请检查后端接口' })
        })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  async function connectAccount(platformId: PlatformId) {
    setOperationStatus({ type: 'loading', message: '正在生成授权链接...' })

    try {
      const result = await createAuthUrlInApi(platformId)

      if (!result.supported) {
        setOperationStatus({ type: 'error', message: result.message })
        return
      }

      if (!result.configured || !result.authUrl) {
        setOperationStatus({ type: 'error', message: result.message })
        return
      }

      window.location.assign(result.authUrl)
    } catch {
      setOperationStatus({ type: 'error', message: '授权链接生成失败，请检查后端配置' })
    }
  }

  async function disconnectAccount(platformId: PlatformId) {
    setOperationStatus({ type: 'loading', message: '正在断开账号连接...' })

    try {
      const updated = await disconnectAccountInApi(platformId)
      setAccounts((current) => current.map((account) => (account.platformId === platformId ? updated : account)))
      setOperationStatus({ type: 'success', message: `${updated.platformName} 已断开连接` })
    } catch {
      setOperationStatus({ type: 'error', message: '断开账号失败，请稍后重试' })
    }
  }

  return {
    accounts,
    operationStatus,
    loadAccounts,
    connectAccount,
    disconnectAccount,
  }
}
