import { useState } from 'react'
import type { PlatformDetectionResult, PlatformInput } from '@/domain/platforms/model'
import { detectPlatformInApi } from './api'

interface PlatformUrlDetectorProps {
  onDetected: (platform: PlatformInput) => void
}

export function PlatformUrlDetector({ onDetected }: PlatformUrlDetectorProps) {
  const [url, setUrl] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)
  const [result, setResult] = useState<PlatformDetectionResult | null>(null)
  const [error, setError] = useState('')

  async function detect() {
    if (!url.trim()) {
      setError('请输入平台网址')
      return
    }

    setIsDetecting(true)
    setError('')

    try {
      const nextResult = await detectPlatformInApi(url)
      setResult(nextResult)
    } catch (currentError) {
      setResult(null)
      setError(currentError instanceof Error ? currentError.message : '识别平台失败')
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">智能新增</p>
        <h2 className="mt-2 text-lg font-semibold">通过网址识别平台</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          输入平台首页或创作者后台地址，系统会先匹配内置模板；未命中时生成通用配置，再由你确认保存。
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void detect()
            }
          }}
          placeholder="例如 https://www.douyin.com"
        />
        <button
          type="button"
          onClick={() => void detect()}
          disabled={isDetecting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isDetecting ? '识别中' : '识别平台'}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                {result.matched ? '已命中平台模板' : '未命中模板，已生成通用配置'}
              </p>
              <h3 className="mt-1 text-base font-semibold">{result.platform.displayName}</h3>
              <p className="mt-1 text-sm text-slate-600">{result.platform.description}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">
              {result.hostname}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-slate-600">
            <div className="flex justify-between gap-3">
              <dt>平台标识</dt>
              <dd className="font-medium text-slate-900">{result.platform.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>标题限制</dt>
              <dd className="font-medium text-slate-900">{result.platform.maxTitleLength} 字</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>正文限制</dt>
              <dd className="font-medium text-slate-900">{result.platform.maxContentLength} 字</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => onDetected(result.platform)}
            className="mt-4 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
          >
            使用此配置
          </button>
        </div>
      ) : null}
    </section>
  )
}
