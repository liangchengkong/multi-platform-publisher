import type { SourceContent } from '@/domain/publisher/model'

interface ContentEditorProps {
  source: SourceContent
  onChange: (source: Pick<SourceContent, 'title' | 'body'>) => void
}

function countWords(value: string) {
  return value.trim().length
}

export function ContentEditor({ source, onChange }: ContentEditorProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">原文编辑</h2>
          <p className="mt-1 text-xs text-slate-500">内容变化后会重新生成各平台版本</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {countWords(source.body)} 字
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">标题</label>
          <input
            value={source.title}
            onChange={(event) => onChange({ title: event.target.value, body: source.body })}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            placeholder="输入内容标题"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">正文 Markdown</label>
          <textarea
            value={source.body}
            onChange={(event) => onChange({ title: source.title, body: event.target.value })}
            className="mt-2 min-h-[520px] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 font-mono text-sm leading-6 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            placeholder="输入正文，支持 Markdown"
          />
        </div>
      </div>
    </div>
  )
}
