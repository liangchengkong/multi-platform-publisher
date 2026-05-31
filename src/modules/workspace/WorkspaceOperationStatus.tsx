type OperationStatusType = 'idle' | 'saving' | 'saved' | 'error' | 'publishing'

interface WorkspaceOperationStatusProps {
  status: {
    type: OperationStatusType
    message: string
    updatedAt?: string
  }
}

const statusClassName: Record<OperationStatusType, string> = {
  idle: 'border-slate-200 bg-white text-slate-600',
  saving: 'border-amber-200 bg-amber-50 text-amber-800',
  saved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  publishing: 'border-sky-200 bg-sky-50 text-sky-800',
}

const dotClassName: Record<OperationStatusType, string> = {
  idle: 'bg-slate-400',
  saving: 'bg-amber-500',
  saved: 'bg-emerald-500',
  error: 'bg-rose-500',
  publishing: 'bg-sky-500',
}

function formatTime(value?: string) {
  if (!value) return null
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function WorkspaceOperationStatus({ status }: WorkspaceOperationStatusProps) {
  const time = formatTime(status.updatedAt)

  return (
    <div
      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2 text-sm ${statusClassName[status.type]}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassName[status.type]}`} />
        <span className="truncate font-medium">{status.message}</span>
      </div>
      {time ? <span className="shrink-0 text-xs opacity-70">{time}</span> : null}
    </div>
  )
}
