import type { BuiltInPlatformId, PlatformDefinition } from '@/domain/publisher/model'

export const builtInPlatformIds: BuiltInPlatformId[] = ['wechat', 'zhihu', 'bilibili', 'xiaohongshu']

export const defaultPlatforms: PlatformDefinition[] = [
  {
    id: 'wechat',
    displayName: '微信公众号',
    shortName: '微信',
    colorClass: 'bg-emerald-600',
    accentClass: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    description: '适合结构完整、段落清晰的长图文内容。',
    source: 'builtin',
    maxTitleLength: 64,
    maxContentLength: 20000,
    requiredFields: ['标题', '正文', '封面图（真实发布时）'],
    styleGuide: '保留完整论述，使用清晰标题层级，适合沉稳型内容。',
    enabled: true,
    config: {},
  },
  {
    id: 'zhihu',
    displayName: '知乎',
    shortName: '知乎',
    colorClass: 'bg-sky-600',
    accentClass: 'border-sky-500 bg-sky-50 text-sky-800',
    description: '适合观点明确、论证充分的问答和专栏内容。',
    source: 'builtin',
    maxTitleLength: 80,
    maxContentLength: 50000,
    requiredFields: ['标题', '正文', '话题'],
    styleGuide: '保留 Markdown 结构，突出问题、结论和论据。',
    enabled: true,
    config: {},
  },
  {
    id: 'bilibili',
    displayName: 'B站专栏',
    shortName: 'B站',
    colorClass: 'bg-pink-600',
    accentClass: 'border-pink-500 bg-pink-50 text-pink-800',
    description: '适合轻松、分段明显、便于社区阅读的专栏内容。',
    source: 'builtin',
    maxTitleLength: 40,
    maxContentLength: 12000,
    requiredFields: ['标题', '正文', '分区（真实发布时）'],
    styleGuide: '减少密集段落，保留小标题，语气更直接。',
    enabled: true,
    config: {},
  },
  {
    id: 'xiaohongshu',
    displayName: '小红书',
    shortName: '小红书',
    colorClass: 'bg-rose-600',
    accentClass: 'border-rose-500 bg-rose-50 text-rose-800',
    description: '适合短文案、标签明确、强调经验和行动建议。',
    source: 'builtin',
    maxTitleLength: 20,
    maxContentLength: 1000,
    requiredFields: ['标题', '正文', '标签', '图片（真实发布时）'],
    styleGuide: '提炼重点，口语化表达，自动补充话题标签。',
    enabled: true,
    config: {},
  },
]

export function isBuiltInPlatformId(value: string): value is BuiltInPlatformId {
  return builtInPlatformIds.includes(value as BuiltInPlatformId)
}

export function findPlatform(platforms: PlatformDefinition[], id: string) {
  return platforms.find((platform) => platform.id === id)
}
