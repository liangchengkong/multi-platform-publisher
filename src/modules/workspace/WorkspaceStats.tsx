import type { WorkspaceState } from '@/domain/publisher/model'

interface WorkspaceStatsProps {
  state: WorkspaceState
}

export function WorkspaceStats({ state }: WorkspaceStatsProps) {
  const successfulRecords = state.records.filter((record) => record.status === 'success').length

  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-sm">
      <div className="rounded-md bg-white px-4 py-2 shadow-sm">
        <div className="text-lg font-semibold">{state.selectedPlatformIds.length}</div>
        <div className="text-xs text-slate-500">已选平台</div>
      </div>
      <div className="rounded-md bg-white px-4 py-2 shadow-sm">
        <div className="text-lg font-semibold">{state.records.length}</div>
        <div className="text-xs text-slate-500">发布记录</div>
      </div>
      <div className="rounded-md bg-white px-4 py-2 shadow-sm">
        <div className="text-lg font-semibold">{successfulRecords}</div>
        <div className="text-xs text-slate-500">成功模拟</div>
      </div>
    </div>
  )
}
