import type { PlatformDefinition } from '@/domain/publisher/model'

interface PlatformRuleCardProps {
  platform: PlatformDefinition
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export function PlatformRuleCard({ platform, onToggle, onEdit, onDelete }: PlatformRuleCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${platform.colorClass}`} />
            <h2 className="text-lg font-semibold">{platform.displayName}</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {platform.source === 'custom' ? '自定义' : '内置'}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{platform.description}</p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600">
          <input type="checkbox" checked={platform.enabled} onChange={onToggle} />
          启用
        </label>
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="font-medium text-slate-800">内容限制</dt>
          <dd className="mt-1 text-slate-600">
            标题 {platform.maxTitleLength} 字，正文 {platform.maxContentLength} 字
          </dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="font-medium text-slate-800">必填字段</dt>
          <dd className="mt-1 text-slate-600">{platform.requiredFields.join('、')}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="font-medium text-slate-800">风格规则</dt>
          <dd className="mt-1 text-slate-600">{platform.styleGuide}</dd>
        </div>
      </dl>
      {platform.source === 'custom' ? (
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onEdit} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            编辑
          </button>
          <button type="button" onClick={onDelete} className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
            删除
          </button>
        </div>
      ) : null}
    </article>
  )
}
