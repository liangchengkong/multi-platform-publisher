import type { PlatformAccountStatus } from '@/domain/accounts/model'
import type { PlatformDefinition, PlatformId } from '@/domain/publisher/model'

interface PlatformSelectorProps {
  platforms: PlatformDefinition[]
  selectedPlatformIds: PlatformId[]
  accountStatuses: PlatformAccountStatus[]
  isPublishing: boolean
  onToggle: (platformId: PlatformId) => void
  onPublish: () => void
}

function getAccountText(account?: PlatformAccountStatus) {
  if (!account) return '账号状态加载中'
  if (account.connected && account.authType === 'oauth') return '真实账号已授权'
  if (account.connected) return '模拟账号已连接'
  if (account.supportsOAuth) return '真实账号未授权'
  return '模拟账号'
}

export function PlatformSelector({
  platforms,
  selectedPlatformIds,
  accountStatuses,
  isPublishing,
  onToggle,
  onPublish,
}: PlatformSelectorProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">发布平台</h2>
          <p className="mt-1 text-xs text-slate-500">关闭的平台可在平台规则页重新启用</p>
        </div>
        <span className="text-sm font-medium text-slate-500">已选 {selectedPlatformIds.length}</span>
      </div>
      <div className="mt-4 grid gap-3">
        {platforms.map((platform) => {
          const checked = selectedPlatformIds.includes(platform.id)
          const account = accountStatuses.find((item) => item.platformId === platform.id)
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onToggle(platform.id)}
              className={`group flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
                checked
                  ? `${platform.accentClass} shadow-sm`
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                  checked ? 'border-current bg-white/70' : 'border-slate-300'
                }`}
              >
                {checked ? '✓' : ''}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${platform.colorClass}`} />
                  {platform.displayName}
                </span>
                <span className="mt-1 block text-sm leading-5 opacity-80">{platform.description}</span>
                <span className="mt-2 block text-xs font-medium opacity-70">{getAccountText(account)}</span>
              </span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onPublish}
        disabled={isPublishing || selectedPlatformIds.length === 0}
        className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isPublishing ? '模拟发布中...' : '一键模拟发布'}
      </button>
    </div>
  )
}
