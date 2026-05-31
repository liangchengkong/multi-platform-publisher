'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PlatformDefinition } from '@/domain/publisher/model'
import type { PlatformInput } from '@/domain/platforms/model'
import { PlatformExtensionGuide } from './PlatformExtensionGuide'
import { PlatformForm } from './PlatformForm'
import { PlatformRuleCard } from './PlatformRuleCard'
import { PlatformUrlDetector } from './PlatformUrlDetector'
import { usePlatformRules } from './usePlatformRules'

export function PlatformRulesPage() {
  const { platforms, status, togglePlatformEnabled, createPlatform, updatePlatform, deletePlatform, resetAll } = usePlatformRules()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformInput | null>(null)
  const [editingPlatform, setEditingPlatform] = useState<PlatformDefinition | null>(null)

  function openBlankCreateForm() {
    setDetectedPlatform(null)
    setEditingPlatform(null)
    setShowCreateForm((value) => !value)
  }

  function openDetectedCreateForm(platform: PlatformInput) {
    setDetectedPlatform(platform)
    setEditingPlatform(null)
    setShowCreateForm(true)
  }

  function closeCreateForm() {
    setShowCreateForm(false)
    setDetectedPlatform(null)
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">平台配置</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                数据库驱动
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold md:text-3xl">平台管理与适配规则</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              输入平台网址可自动识别模板，也可以展开高级配置手动调整。创建后的平台会自动进入工作台、账号页和模拟发布流程。
            </p>
            <div
              className={`mt-4 inline-flex rounded-lg border px-4 py-2 text-sm ${
                status.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {status.message}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              返回工作台
            </Link>
            <button
              type="button"
              onClick={openBlankCreateForm}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              新增平台
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="grid content-start gap-4 md:grid-cols-2">
          {platforms.map((platform) => (
            <PlatformRuleCard
              key={platform.id}
              platform={platform}
              onToggle={() => togglePlatformEnabled(platform.id)}
              onEdit={() => {
                setEditingPlatform(platform)
                setShowCreateForm(false)
                setDetectedPlatform(null)
              }}
              onDelete={() => {
                if (window.confirm(`确定删除 ${platform.displayName} 吗？`)) {
                  void deletePlatform(platform.id)
                }
              }}
            />
          ))}
        </section>
        <aside className="space-y-5">
          <PlatformUrlDetector onDetected={openDetectedCreateForm} />

          {showCreateForm ? (
            <PlatformForm
              key={detectedPlatform?.name ?? 'blank-create'}
              initialValue={detectedPlatform ?? undefined}
              collapsedByDefault={!!detectedPlatform}
              onSubmit={(input) => {
                void createPlatform(input)
                closeCreateForm()
              }}
              onCancel={closeCreateForm}
            />
          ) : null}

          {editingPlatform ? (
            <PlatformForm
              key={editingPlatform.id}
              platform={editingPlatform}
              onSubmit={(input) => {
                void updatePlatform(editingPlatform.id, input)
                setEditingPlatform(null)
              }}
              onCancel={() => setEditingPlatform(null)}
            />
          ) : null}

          <PlatformExtensionGuide />
        </aside>
      </div>
    </main>
  )
}
