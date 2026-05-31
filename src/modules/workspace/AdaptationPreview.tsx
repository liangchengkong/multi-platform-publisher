import type { AdaptedContent, PlatformDefinition, PlatformId } from '@/domain/publisher/model'

interface AdaptationPreviewProps {
  platforms: PlatformDefinition[]
  activePlatformId: PlatformId
  activePlatform?: PlatformDefinition
  activeAdapted?: AdaptedContent
  onSelectPlatform: (platformId: PlatformId) => void
}

function countWords(value: string) {
  return value.trim().length
}

export function AdaptationPreview({
  platforms,
  activePlatformId,
  activePlatform,
  activeAdapted,
  onSelectPlatform,
}: AdaptationPreviewProps) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold">适配预览</h2>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => onSelectPlatform(platform.id)}
                disabled={!platform.enabled}
                className={`rounded-md px-2 py-2 text-sm font-medium transition ${
                  activePlatformId === platform.id
                    ? `${platform.colorClass} text-white shadow-sm`
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {platform.shortName}
              </button>
            ))}
          </div>
        </div>

        {activePlatform && activeAdapted ? (
          <div className="space-y-4 p-5">
            <div className={`rounded-lg border p-4 ${activePlatform.accentClass}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{activePlatform.displayName}</div>
                <span className="text-xs opacity-75">
                  {countWords(activeAdapted.body)} / {activePlatform.maxContentLength}
                </span>
              </div>
              <div className="mt-2 text-sm leading-5">{activePlatform.styleGuide}</div>
            </div>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-500">适配标题</div>
              <h3 className="mt-2 break-words text-base font-semibold leading-6 text-slate-950">{activeAdapted.title}</h3>
            </section>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-500">适配正文</div>
              <pre className="mt-2 max-h-[420px] whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">
                {activeAdapted.body}
              </pre>
            </section>

            <div className="flex flex-wrap gap-2">
              {activeAdapted.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>
            {activeAdapted.warnings.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                {activeAdapted.warnings.join(' ')}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
