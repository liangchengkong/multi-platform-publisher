import type { PlatformAccountStatus } from '@/domain/accounts/model'

interface AccountCardProps {
  account: PlatformAccountStatus
  onConnect: () => void
  onDisconnect: () => void
}

function formatExpiresAt(value?: string) {
  if (!value) return '无过期时间'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function AccountCard({ account, onConnect, onDisconnect }: AccountCardProps) {
  const statusText = account.connected ? '已连接' : account.supportsOAuth ? '未连接' : '模拟账号'
  const statusClassName = account.connected
    ? 'bg-emerald-100 text-emerald-700'
    : account.supportsOAuth
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-600'

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{account.platformName}</h2>
          <p className="mt-1 text-sm text-slate-500">{account.accountName}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>{statusText}</span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="font-medium text-slate-800">授权类型</dt>
          <dd className="mt-1 text-slate-600">{account.authType === 'oauth' ? 'OAuth 授权' : '模拟账号'}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="font-medium text-slate-800">Token 过期时间</dt>
          <dd className="mt-1 text-slate-600">{formatExpiresAt(account.expiresAt)}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="font-medium text-slate-800">说明</dt>
          <dd className="mt-1 leading-6 text-slate-600">{account.message}</dd>
        </div>
      </dl>

      <div className="mt-5 flex gap-3">
        {account.supportsOAuth ? (
          <>
            <button
              type="button"
              onClick={onConnect}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
            >
              {account.connected ? '重新授权' : '连接账号'}
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              disabled={!account.connected}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              断开连接
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            查看授权能力
          </button>
        )}
      </div>
    </article>
  )
}
