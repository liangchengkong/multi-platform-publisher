import { useState } from 'react'
import type { PlatformDefinition } from '@/domain/publisher/model'
import type { PlatformInput } from '@/domain/platforms/model'

interface PlatformFormProps {
  platform?: PlatformDefinition
  onSubmit: (input: PlatformInput) => void
  onCancel?: () => void
}

const colorOptions = [
  { label: '石板灰', colorClass: 'bg-slate-600', accentClass: 'border-slate-500 bg-slate-50 text-slate-800' },
  { label: '蓝色', colorClass: 'bg-blue-600', accentClass: 'border-blue-500 bg-blue-50 text-blue-800' },
  { label: '紫色', colorClass: 'bg-violet-600', accentClass: 'border-violet-500 bg-violet-50 text-violet-800' },
  { label: '橙色', colorClass: 'bg-orange-600', accentClass: 'border-orange-500 bg-orange-50 text-orange-800' },
]

function toText(value: string[] | undefined) {
  return (value ?? []).join('、')
}

function fromText(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function PlatformForm({ platform, onSubmit, onCancel }: PlatformFormProps) {
  const [name, setName] = useState(platform?.id ?? '')
  const [displayName, setDisplayName] = useState(platform?.displayName ?? '')
  const [shortName, setShortName] = useState(platform?.shortName ?? '')
  const [description, setDescription] = useState(platform?.description ?? '')
  const [styleGuide, setStyleGuide] = useState(platform?.styleGuide ?? '')
  const [requiredFields, setRequiredFields] = useState(toText(platform?.requiredFields ?? ['标题', '正文']))
  const [maxTitleLength, setMaxTitleLength] = useState(platform?.maxTitleLength ?? 40)
  const [maxContentLength, setMaxContentLength] = useState(platform?.maxContentLength ?? 5000)
  const [colorIndex, setColorIndex] = useState(0)
  const [titleSuffix, setTitleSuffix] = useState(platform?.config?.titleSuffix ?? '')
  const [bodyPrefix, setBodyPrefix] = useState(platform?.config?.bodyPrefix ?? '')
  const [bodySuffix, setBodySuffix] = useState(platform?.config?.bodySuffix ?? '')
  const [fixedTags, setFixedTags] = useState(toText(platform?.config?.fixedTags ?? ['创作']))
  const [stripMarkdown, setStripMarkdown] = useState(platform?.config?.stripMarkdown ?? true)
  const [compactBlankLines, setCompactBlankLines] = useState(platform?.config?.compactBlankLines ?? true)

  const selectedColor = colorOptions[colorIndex]
  const isEditing = !!platform

  function submit() {
    onSubmit({
      name,
      displayName,
      shortName: shortName || displayName,
      description,
      colorClass: platform?.colorClass ?? selectedColor.colorClass,
      accentClass: platform?.accentClass ?? selectedColor.accentClass,
      maxTitleLength,
      maxContentLength,
      requiredFields: fromText(requiredFields),
      styleGuide,
      config: {
        titleSuffix,
        bodyPrefix,
        bodySuffix,
        fixedTags: fromText(fixedTags),
        stripMarkdown,
        stripHtml: true,
        compactBlankLines,
      },
    })
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">{isEditing ? '编辑自定义平台' : '新增自定义平台'}</h2>
      <div className="mt-4 grid gap-3">
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={isEditing} value={name} onChange={(event) => setName(event.target.value)} placeholder="平台标识，例如 douyin" />
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="平台名称，例如 抖音" />
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={shortName} onChange={(event) => setShortName(event.target.value)} placeholder="短名称，例如 抖音" />
        <textarea className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="平台说明" />
        {!isEditing ? (
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={colorIndex} onChange={(event) => setColorIndex(Number(event.target.value))}>
            {colorOptions.map((option, index) => (
              <option key={option.label} value={index}>{option.label}</option>
            ))}
          </select>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" type="number" value={maxTitleLength} onChange={(event) => setMaxTitleLength(Number(event.target.value))} />
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" type="number" value={maxContentLength} onChange={(event) => setMaxContentLength(Number(event.target.value))} />
        </div>
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={requiredFields} onChange={(event) => setRequiredFields(event.target.value)} placeholder="必填字段，用顿号分隔" />
        <textarea className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm" value={styleGuide} onChange={(event) => setStyleGuide(event.target.value)} placeholder="风格说明" />
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={titleSuffix} onChange={(event) => setTitleSuffix(event.target.value)} placeholder="标题后缀，可为空" />
        <textarea className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm" value={bodyPrefix} onChange={(event) => setBodyPrefix(event.target.value)} placeholder="正文开头模板，可为空" />
        <textarea className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm" value={bodySuffix} onChange={(event) => setBodySuffix(event.target.value)} placeholder="正文结尾模板，可为空" />
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={fixedTags} onChange={(event) => setFixedTags(event.target.value)} placeholder="固定标签，用顿号分隔" />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={stripMarkdown} onChange={(event) => setStripMarkdown(event.target.checked)} />
          清理 Markdown
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={compactBlankLines} onChange={(event) => setCompactBlankLines(event.target.checked)} />
          压缩多余空行
        </label>
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
    </div>
  )
}
