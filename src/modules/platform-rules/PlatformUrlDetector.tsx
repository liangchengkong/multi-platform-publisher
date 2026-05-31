import { useState } from 'react'
import type {
  PlatformContentType,
  PlatformDetectionResult,
  PlatformInferenceResult,
  PlatformInput,
  PlatformSampleAnalysisResult,
  PlatformStylePreference,
} from '@/domain/platforms/model'
import { analyzePlatformSamplesInApi, detectPlatformInApi, inferPlatformConfigInApi } from './api'

interface PlatformUrlDetectorProps {
  onDetected: (platform: PlatformInput) => void
}

const contentTypeOptions: Array<{ value: PlatformContentType; label: string; description: string }> = [
  { value: 'long_article', label: '图文长文', description: '公众号、专栏、博客类内容' },
  { value: 'short_post', label: '短文动态', description: '微博、动态、社区帖子' },
  { value: 'video_description', label: '视频简介', description: 'B站、短视频标题和简介' },
  { value: 'qa_answer', label: '问答回答', description: '知乎回答、问答社区' },
  { value: 'technical_article', label: '技术文章', description: '掘金、CSDN、工程实践' },
  { value: 'product_note', label: '商品种草笔记', description: '小红书、测评、清单类内容' },
]

const styleOptions: Array<{ value: PlatformStylePreference; label: string }> = [
  { value: 'professional', label: '专业' },
  { value: 'conversational', label: '口语化' },
  { value: 'short_sentences', label: '短句' },
  { value: 'long_form', label: '长文结构' },
  { value: 'with_hashtags', label: '带话题' },
  { value: 'preserve_markdown', label: '保留 Markdown' },
  { value: 'strip_markdown', label: '去掉 Markdown' },
]

function parseSamples(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .split(/\n-{3,}\n/)
    .map((sample) => sample.trim())
    .filter(Boolean)
}

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

export function PlatformUrlDetector({ onDetected }: PlatformUrlDetectorProps) {
  const [url, setUrl] = useState('')
  const [platformName, setPlatformName] = useState('')
  const [contentType, setContentType] = useState<PlatformContentType>('long_article')
  const [officialRulesUrl, setOfficialRulesUrl] = useState('')
  const [knownRules, setKnownRules] = useState('')
  const [samplesText, setSamplesText] = useState('')
  const [targetStyles, setTargetStyles] = useState<PlatformStylePreference[]>(['professional'])
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

      const context = {
        platformName,
        contentType,
        officialRulesUrl,
        knownRules,
        targetStyles,
      }
      const shouldInfer = !nextResult.matched
        || Boolean(platformName.trim())
        || Boolean(officialRulesUrl.trim())
        || Boolean(knownRules.trim())
        || samples.length > 0
        || targetStyles.length > 0

      if (shouldInfer) {
        const nextInference = await inferPlatformConfigInApi(nextPlatform, knownRules, samples, context)
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
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">新增平台向导</p>
        <h2 className="mt-2 text-lg font-semibold">提供平台信息，生成格式配置</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          系统会按“平台网址、内容类型、官方规则、样例内容、目标风格”的顺序生成建议配置。规则不会直接入库，仍需你确认后创建平台。
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          平台网址
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="例如 https://juejin.cn"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          平台名称，可选
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
            value={platformName}
            onChange={(event) => setPlatformName(event.target.value)}
            placeholder="识别不准时填写，例如 掘金"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          目标内容类型
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
            value={contentType}
            onChange={(event) => setContentType(event.target.value as PlatformContentType)}
          >
            {contentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          官方规则链接，可选
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
            value={officialRulesUrl}
            onChange={(event) => setOfficialRulesUrl(event.target.value)}
            placeholder="例如平台帮助中心、创作者规范、发布说明链接"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          已知平台限制，可选
          <textarea
            className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-slate-500"
            value={knownRules}
            onChange={(event) => setKnownRules(event.target.value)}
            placeholder="例如：标题最多 60 字，正文最多 5000 字，最多 5 个标签，必须选择分类和封面"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          样例内容，可选
          <textarea
            className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-slate-500"
            value={samplesText}
            onChange={(event) => setSamplesText(event.target.value)}
            placeholder="粘贴 1-3 条平台优秀样例或你的历史内容；多条样例可用单独一行 --- 分隔"
          />
        </label>

        <div className="grid gap-2">
          <p className="text-sm font-medium text-slate-700">目标风格</p>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTargetStyles((current) => toggleValue(current, option.value))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  targetStyles.includes(option.value)
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void detect()}
          disabled={isDetecting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isDetecting ? '生成中' : '生成平台配置'}
        </button>
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
            <div className="flex justify-between gap-3">
              <dt>必填字段</dt>
              <dd className="font-medium text-slate-900">{platform.requiredFields.join('、')}</dd>
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
            </div>
          ) : null}

          {inference ? (
            <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-blue-900">推断依据</p>
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
