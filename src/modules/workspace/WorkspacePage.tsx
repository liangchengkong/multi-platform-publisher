'use client'

import Link from 'next/link'
import { AdaptationPreview } from './AdaptationPreview'
import { ContentEditor } from './ContentEditor'
import { PlatformSelector } from './PlatformSelector'
import { PublishHistory } from './PublishHistory'
import { useWorkspace } from './useWorkspace'
import { WorkspaceOperationStatus } from './WorkspaceOperationStatus'
import { WorkspaceStats } from './WorkspaceStats'

export function WorkspacePage() {
  const {
    state,
    enabledPlatforms,
    activePlatformId,
    activePlatform,
    activeAdapted,
    accountStatuses,
    operationStatus,
    setActivePlatformId,
    isPublishing,
    updateSource,
    toggleSelectedPlatform,
    publishSelected,
    clearRecords,
    resetAll,
  } = useWorkspace()

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">模拟发布</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                数据库驱动平台
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal md:text-3xl">多平台内容发布工作台</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              输入一份原文，自动生成内置平台和自定义平台的适配版本。你可以逐个平台微调，再执行一键模拟发布。
            </p>
            <div className="mt-4 max-w-3xl">
              <WorkspaceOperationStatus status={operationStatus} />
            </div>
          </div>
          <WorkspaceStats state={state} />
          <div className="flex flex-wrap gap-3">
            <Link
              href="/accounts"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              账号管理
            </Link>
            <Link
              href="/platforms"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              平台规则
            </Link>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
            >
              格式化数据
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        <section className="grid gap-5 lg:grid-cols-[minmax(420px,0.95fr)_minmax(360px,0.8fr)]">
          <ContentEditor source={state.source} onChange={updateSource} />
          <div className="space-y-5">
            <PlatformSelector
              platforms={enabledPlatforms}
              selectedPlatformIds={state.selectedPlatformIds}
              accountStatuses={accountStatuses}
              isPublishing={isPublishing}
              onToggle={toggleSelectedPlatform}
              onPublish={publishSelected}
            />
            <PublishHistory records={state.records} onClear={clearRecords} />
          </div>
        </section>

        <AdaptationPreview
          platforms={state.platforms}
          activePlatformId={activePlatformId}
          activePlatform={activePlatform}
          activeAdapted={activeAdapted}
          onSelectPlatform={setActivePlatformId}
        />
      </div>
    </main>
  )
}
