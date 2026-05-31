import { useState } from 'react'
import type { PlatformDefinition } from '@/domain/publisher/model'
import type { PlatformInput } from '@/domain/platforms/model'

interface PlatformFormProps {
  platform?: PlatformDefinition
  initialValue?: PlatformInput
  collapsedByDefault?: boolean
  onSubmit: (input: PlatformInput) => void
  onCancel?: () => void
}

const colorOptions = [
  { label: '石板灰', colorClass: 'bg-slate-600', accentClass: 'border-slate-500 bg-slate-50 text-slate-800' },
  { label: '蓝色', colorClass: 'bg-blue-600', accentClass: 'border-blue-500 bg-blue-50 text-blue-800' },
  { label: '紫色', colorClass: 'bg-violet-600', accentClass: 'border-violet-500 bg-violet-50 text-violet-800' },
  { label: '橙色', colorClass: 'bg-orange-600', accentClass: 'border-orange-500 bg-orange-50 text-orange-800' },
  { label: '红色', colorClass: 'bg-red-600', accentClass: 'border-red-500 bg-red-50 text-red-800' },
  { label: '头条红', colorClass: 'bg-red-500', accentClass: 'border-red-400 bg-red-50 text-red-800' },
  { label: '玫红', colorClass: 'bg-rose-600', accentClass: 'border-rose-500 bg-rose-50 text-rose-800' },
  { label: '黑色', colorClass: 'bg-zinc-900', accentClass: 'border-zinc-500 bg-zinc-50 text-zinc-800' },
]

const emptyPlatform: PlatformInput = {
  name: '',
  displayName: '',
  shortName: '',
  description: '',
  colorClass: colorOptions[0].colorClass,
  accentClass: colorOptions[0].accentClass,
  maxTitleLength: 60,
  maxContentLength: 10000,
  requiredFields: ['标题', '正文'],
  styleGuide: '',
  config: {
    stripHtml: true,
    stripMarkdown: false,
    compactBlankLines: true,
    fixedTags: ['创作'],
  },
}

function toText(value: string[] | undefined) {
  return (value ?? []).join('、')
}

function fromText(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function inputFromPlatform(platform?: PlatformDefinition, initialValue?: PlatformInput): PlatformInput {
  if (platform) {
    return {
      name: platform.id,
      displayName: platform.displayName,
      shortName: platform.shortName,
      description: platform.description,
      colorClass: platform.colorClass,
      accentClass: platform.accentClass,
      maxTitleLength: platform.maxTitleLength,
      maxContentLength: platform.maxContentLength,
      requiredFields: platform.requiredFields,
      styleGuide: platform.styleGuide,
      config: platform.config ?? emptyPlatform.config,
    }
  }

  return initialValue ?? emptyPlatform
}

export function PlatformForm({ platform, initialValue, collapsedByDefault = false, onSubmit, onCancel }: PlatformFormProps) {
  const initial = inputFromPlatform(platform, initialValue)
  const initialColorIndex = Math.max(
    0,
    colorOptions.findIndex((option) => option.colorClass === initial.colorClass && option.accentClass === initial.accentClass),
  )

  const [name, setName] = useState(initial.name)
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [shortName, setShortName] = useState(initial.shortName)
  const [description, setDescription] = useState(initial.description)
  const [styleGuide, setStyleGuide] = useState(initial.styleGuide)
  const [requiredFields, setRequiredFields] = useState(toText(initial.requiredFields))
  const [maxTitleLength, setMaxTitleLength] = useState(initial.maxTitleLength)
  const [maxContentLength, setMaxContentLength] = useState(initial.maxContentLength)
  const [colorIndex, setColorIndex] = useState(initialColorIndex)
  const [titlePrefix, setTitlePrefix] = useState(initial.config?.titlePrefix ?? '')
  const [titleSuffix, setTitleSuffix] = useState(initial.config?.titleSuffix ?? '')
  const [bodyPrefix, setBodyPrefix] = useState(initial.config?.bodyPrefix ?? '')
  const [bodySuffix, setBodySuffix] = useState(initial.config?.bodySuffix ?? '')
  const [fixedTags, setFixedTags] = useState(toText(initial.config?.fixedTags ?? ['创作']))
  const [stripMarkdown, setStripMarkdown] = useState(initial.config?.stripMarkdown ?? false)
  const [stripHtml, setStripHtml] = useState(initial.config?.stripHtml ?? true)
  const [compactBlankLines, setCompactBlankLines] = useState(initial.config?.compactBlankLines ?? true)
  const [showAdvanced, setShowAdvanced] = useState(!collapsedByDefault || !!platform)

  const selectedColor = colorOptions[colorIndex]
  const isEditing = !!platform

  function submit() {
    onSubmit({
      name: name.trim(),
      displayName: displayName.trim(),
      shortName: (shortName || displayName).trim(),
      description: description.trim(),
      colorClass: isEditing ? platform.colorClass : selectedColor.colorClass,
      accentClass: isEditing ? platform.accentClass : selectedColor.accentClass,
      maxTitleLength,
      maxContentLength,
      requiredFields: fromText(requiredFields),
      styleGuide: styleGuide.trim(),
      config: {
        titlePrefix,
        titleSuffix,
        bodyPrefix,
        bodySuffix,
        fixedTags: fromText(fixedTags),
        stripMarkdown,
        stripHtml,
        compactBlankLines,
      },
    })
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{isEditing ? '编辑自定义平台' : '确认新增平台'}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {isEditing ? '调整平台展示信息和适配规则。' : '确认基础信息后即可创建，也可以展开高级配置微调规则。'}
          </p>
        </div>
        {!isEditing ? <span className={`h-3 w-3 rounded-full ${selectedColor.colorClass}`} /> : null}
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          平台标识
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500 disabled:bg-slate-100"
            disabled={isEditing}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如 douyin"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          平台名称
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="例如 抖音"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          短名称
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
            value={shortName}
            onChange={(event) => setShortName(event.target.value)}
            placeholder="例如 抖音"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          平台说明
          <textarea
            className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-slate-500"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="说明这个平台适合什么内容"
          />
        </label>

        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {showAdvanced ? '收起高级配置' : '展开高级配置'}
        </button>

        {showAdvanced ? (
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {!isEditing ? (
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                主题色
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
                  value={colorIndex}
                  onChange={(event) => setColorIndex(Number(event.target.value))}
                >
                  {colorOptions.map((option, index) => (
                    <option key={option.label} value={index}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                标题字数
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
                  type="number"
                  min={1}
                  value={maxTitleLength}
                  onChange={(event) => setMaxTitleLength(Number(event.target.value))}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                正文字数
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
                  type="number"
                  min={1}
                  value={maxContentLength}
                  onChange={(event) => setMaxContentLength(Number(event.target.value))}
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              必填字段
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500"
                value={requiredFields}
                onChange={(event) => setRequiredFields(event.target.value)}
                placeholder="标题、正文、标签"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              风格说明
              <textarea
                className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-slate-500"
                value={styleGuide}
                onChange={(event) => setStyleGuide(event.target.value)}
                placeholder="描述适合该平台的语气、段落和结构"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" value={titlePrefix} onChange={(event) => setTitlePrefix(event.target.value)} placeholder="标题前缀，可为空" />
              <input className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" value={titleSuffix} onChange={(event) => setTitleSuffix(event.target.value)} placeholder="标题后缀，可为空" />
            </div>
            <textarea className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-slate-500" value={bodyPrefix} onChange={(event) => setBodyPrefix(event.target.value)} placeholder="正文开头模板，可为空" />
            <textarea className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-slate-500" value={bodySuffix} onChange={(event) => setBodySuffix(event.target.value)} placeholder="正文结尾模板，可为空" />
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" value={fixedTags} onChange={(event) => setFixedTags(event.target.value)} placeholder="固定标签，用顿号或逗号分隔" />

            <div className="grid gap-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={stripMarkdown} onChange={(event) => setStripMarkdown(event.target.checked)} />
                清理 Markdown 标记
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={stripHtml} onChange={(event) => setStripHtml(event.target.checked)} />
                清理 HTML 标记
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={compactBlankLines} onChange={(event) => setCompactBlankLines(event.target.checked)} />
                压缩多余空行
              </label>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={submit} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          {isEditing ? '保存配置' : '创建平台'}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            取消
          </button>
        ) : null}
      </div>
    </section>
  )
}
