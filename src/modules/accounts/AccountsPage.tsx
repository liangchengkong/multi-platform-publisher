'use client'

import Link from 'next/link'
import { AccountCard } from './AccountCard'
import { AccountStatusBanner } from './AccountStatusBanner'
import { useAccounts } from './useAccounts'

export function AccountsPage() {
  const { accounts, operationStatus, loadAccounts, connectAccount, disconnectAccount } = useAccounts()

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">账号授权</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                Provider Registry
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal md:text-3xl">平台账号管理</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              统一管理各平台账号连接状态。当前阶段 B站使用真实 OAuth 授权，其余平台保留模拟账号，为后续真实接入预留扩展接口。
            </p>
            <div className="mt-4 max-w-3xl">
              <AccountStatusBanner status={operationStatus} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              返回工作台
            </Link>
            <Link
              href="/platforms"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              平台规则
            </Link>
            <button
              type="button"
              onClick={() => void loadAccounts(true)}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
            >
              刷新状态
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1280px] gap-4 px-5 py-5 md:grid-cols-2">
        {accounts.map((account) => (
          <AccountCard
            key={account.platformId}
            account={account}
            onConnect={() => void connectAccount(account.platformId)}
            onDisconnect={() => void disconnectAccount(account.platformId)}
          />
        ))}
      </section>
    </main>
  )
}
