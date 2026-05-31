import type { PublishRecord } from '@/domain/publisher/model'

interface PublishHistoryProps {
  records: PublishRecord[]
  onClear: () => void
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function PublishHistory({ records, onClear }: PublishHistoryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold">发布历史</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={records.length === 0}
          className="text-sm font-medium text-slate-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          清空
        </button>
      </div>
      <div className="max-h-[360px] space-y-3 overflow-auto p-5">
        {records.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            暂无发布记录。完成一次模拟发布后会显示每个平台的结果。
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{record.platformName}</div>
                  <div className="mt-1 truncate text-sm text-slate-600">{record.title}</div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                    record.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {record.status === 'success' ? '成功' : '失败'}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{record.message}</p>
              <div className="mt-3 text-xs text-slate-400">{formatTime(record.publishedAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
