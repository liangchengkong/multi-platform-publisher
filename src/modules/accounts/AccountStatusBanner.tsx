type StatusType = 'idle' | 'loading' | 'success' | 'error'

interface AccountStatusBannerProps {
  status: {
    type: StatusType
    message: string
  }
}

const statusClassName: Record<StatusType, string> = {
  idle: 'border-slate-200 bg-white text-slate-600',
  loading: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
}

export function AccountStatusBanner({ status }: AccountStatusBannerProps) {
  return (
    <div className={`rounded-lg border px-4 py-2 text-sm font-medium ${statusClassName[status.type]}`}>
      {status.message}
    </div>
  )
}
