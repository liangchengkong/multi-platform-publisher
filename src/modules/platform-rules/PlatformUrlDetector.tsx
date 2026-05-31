import { useState } from 'react'
import type {
  PlatformDetectionResult,
  PlatformInferenceResult,
  PlatformInput,
  PlatformSampleAnalysisResult,
} from '@/domain/platforms/model'
import { analyzePlatformSamplesInApi, detectPlatformInApi, inferPlatformConfigInApi } from './api'

interface PlatformUrlDetectorProps {
  onDetected: (platform: PlatformInput) => void
}

function parseSamples(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .split(/\n-{3,}\n/)
    .map((sample) => sample.trim())
    .filter(Boolean)
}

export function PlatformUrlDetector({ onDetected }: PlatformUrlDetectorProps) {
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [samplesText, setSamplesText] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)
  const [result, setResult] = useState<PlatformDetectionResult | null>(null)
  const [analysis, setAnalysis] = useState<PlatformSampleAnalysisResult | null>(null)
  const [inference, setInference] = useState<PlatformInferenceResult | null>(null)
  const [error, setError] = useState('')

  async function detect() {
    if (!url.trim()) {
      setError('请输入平台网址')
      return
    }

    setIsDetecting(true)
    setError('')
    setAnalysis(null)
    setInference(null)

    try {
      const samples = parseSamples(samplesText)
      const nextResult = await detectPlatformInApi(url)
      let nextPlatform = nextResult.platform

      if (samples.length > 0) {
        const nextAnalysis = await analyzePlatformSamplesInApi(nextPlatform, samples)
        nextPlatform = nextAnalysis.platform
        setAnalysis(nextAnalysis)
      }

      if (!nextResult.matched || description.trim()) {
        const nextInference = await inferPlatformConfigInApi(nextPlatform, description, samples)
        nextPlatform = nextInference.platform
        setInference(nextInference)
      }

      setResult({ ...nextResult, platform: nextPlatform })
    } catch (currentError) {
      setResult(null)
      setAnalysis(null)
      setInference(null)
      setError(currentError instanceof Error ? currentError.message : '识别平台失败')
    } finally {
      setIsDetecting(false)
    }
  }

  const platform = result?.platform

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">智能新增</p>
        <h2 className="mt-2 text-lg font-semibold">通过网址识别平台</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          输入平台网址后，系统会先匹配模板；如果未命中模板，或你补充了平台描述，系统会用本地推断服务生成更完整的配置建议。
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="flex gap-2">
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

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          平台描述，可选
          <textarea
            className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-slate-500"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="例如：这是一个技术博客平台，适合发布教程、代码和工程实践"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          样例内容，可选
          <textarea
            className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-slate-500"
            value={samplesText}
            onChange={(event) => setSamplesText(event.target.value)}
            placeholder="粘贴 1-3 条样例正文；多条样例可用单独一行 --- 分隔"
          />
        </label>
      </div>

      {error ? (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {result && platform ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                {result.matched ? '已命中平台模板' : '未命中模板，已生成通用配置'}
                {analysis ? '，已合并样例分析' : ''}
                {inference ? '，已合并推断建议' : ''}
              </p>
              <h3 className="mt-1 text-base font-semibold">{platform.displayName}</h3>
              <p className="mt-1 text-sm text-slate-600">{platform.description}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">
              {result.hostname}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-slate-600">
            <div className="flex justify-between gap-3">
              <dt>平台标识</dt>
              <dd className="font-medium text-slate-900">{platform.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>标题限制</dt>
              <dd className="font-medium text-slate-900">{platform.maxTitleLength} 字</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>正文限制</dt>
              <dd className="font-medium text-slate-900">{platform.maxContentLength} 字</dd>
            </div>
          </dl>

          {analysis ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
              <p className="text-sm font-medium text-slate-800">样例分析</p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>样例数：{analysis.metrics.sampleCount}</div>
                <div>平均标题：{analysis.metrics.averageTitleLength} 字</div>
                <div>平均正文：{analysis.metrics.averageContentLength} 字</div>
                <div>话题标签：{analysis.metrics.hashtagCount} 个</div>
              </dl>
              <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-600">
                {analysis.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {inference ? (
            <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-blue-900">推断建议</p>
                <span className="rounded-full bg-white px-2 py-1 text-xs text-blue-700">
                  置信度 {Math.round(inference.confidence * 100)}%
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-blue-800">
                {inference.reasoning.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => onDetected(platform)}
            className="mt-4 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
          >
            使用此配置
          </button>
        </div>
      ) : null}
    </section>
  )
}
