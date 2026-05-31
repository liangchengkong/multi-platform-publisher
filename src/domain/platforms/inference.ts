import type { PlatformInferenceResult, PlatformInput } from './model'

interface PlatformInferenceInput {
  platform: PlatformInput
  description?: string
  samples?: string[]
}

interface InferenceProfile {
  keywords: string[]
  titleLength: number
  contentLength: number
  styleGuide: string
  fixedTags: string[]
  stripMarkdown: boolean
  reasoning: string
}

const profiles: InferenceProfile[] = [
  {
    keywords: ['短视频', '视频', '种草', '生活', '娱乐', '口播', '脚本', 'video', 'shorts', 'reels'],
    titleLength: 30,
    contentLength: 5000,
    styleGuide: '偏短文案表达，开头需要强钩子，正文适合短句和话题标签。',
    fixedTags: ['创作', '短视频'],
    stripMarkdown: true,
    reasoning: '描述或样例体现短视频/种草属性，适合短标题、短段落和话题化表达。',
  },
  {
    keywords: ['社区', '动态', '微博', '社交', '热点', '讨论', 'community', 'social', 'feed'],
    titleLength: 30,
    contentLength: 2000,
    styleGuide: '偏社交动态表达，适合压缩观点、保留互动引导和话题标签。',
    fixedTags: ['观点', '讨论'],
    stripMarkdown: true,
    reasoning: '描述或样例体现社区讨论属性，适合轻量短内容和互动语气。',
  },
  {
    keywords: ['技术', '开发', '编程', '代码', '工程', '教程', '知识库', 'code', 'dev', 'developer', 'engineering', 'tutorial', 'programming'],
    titleLength: 80,
    contentLength: 50000,
    styleGuide: '偏技术长文表达，适合保留 Markdown 层级、代码块、步骤和结论。',
    fixedTags: ['技术', '实践'],
    stripMarkdown: false,
    reasoning: '描述或样例体现技术内容属性，适合保留结构化 Markdown 和较长正文。',
  },
  {
    keywords: ['长文', '专栏', '观点', '深度', '分析', '博客', 'blog', 'article', 'essay', 'column'],
    titleLength: 80,
    contentLength: 30000,
    styleGuide: '偏长文专栏表达，适合保留论证结构、段落层级和完整上下文。',
    fixedTags: ['观点', '分析'],
    stripMarkdown: false,
    reasoning: '描述或样例体现长文/专栏属性，适合更长正文和结构化表达。',
  },
  {
    keywords: ['英文', '海外', 'international', 'english', 'medium', 'newsletter'],
    titleLength: 100,
    contentLength: 50000,
    styleGuide: '偏英文长文表达，适合自然叙事语气、清晰段落和少量标签。',
    fixedTags: ['Writing', 'Productivity'],
    stripMarkdown: false,
    reasoning: '描述或样例体现英文或海外内容平台属性，适合长标题和英文写作标签。',
  },
]

function normalizeText(input: PlatformInferenceInput) {
  return [
    input.platform.displayName,
    input.platform.description,
    input.platform.styleGuide,
    input.description ?? '',
    ...(input.samples ?? []),
  ]
    .join('\n')
    .toLowerCase()
}

function scoreProfile(text: string, profile: InferenceProfile) {
  return profile.keywords.reduce((score, keyword) => score + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0)
}

function mergeStyleGuide(current: string, inferred: string) {
  if (current.includes(inferred)) return current
  return `${current}\n${inferred}`.trim()
}

function buildGenericReasoning(input: PlatformInferenceInput) {
  const hasDescription = Boolean(input.description?.trim())
  const hasSamples = (input.samples ?? []).some((sample) => sample.trim())

  if (hasDescription && hasSamples) {
    return '未匹配到明确平台画像，已结合平台描述和样例内容生成通用适配建议。'
  }

  if (hasDescription) {
    return '未匹配到明确平台画像，已根据平台描述生成通用适配建议。'
  }

  if (hasSamples) {
    return '未匹配到明确平台画像，已根据样例内容生成通用适配建议。'
  }

  return '未提供足够上下文，保留通用平台配置。'
}

export function inferPlatformConfig(input: PlatformInferenceInput): PlatformInferenceResult {
  const text = normalizeText(input)
  const rankedProfiles = profiles
    .map((profile) => ({ profile, score: scoreProfile(text, profile) }))
    .sort((left, right) => right.score - left.score)
  const best = rankedProfiles[0]

  if (best && best.score > 0) {
    return {
      provider: 'local-rules',
      confidence: Math.min(0.92, 0.55 + best.score * 0.12),
      reasoning: [best.profile.reasoning],
      platform: {
        ...input.platform,
        maxTitleLength: Math.max(input.platform.maxTitleLength, best.profile.titleLength),
        maxContentLength: Math.max(input.platform.maxContentLength, best.profile.contentLength),
        styleGuide: mergeStyleGuide(input.platform.styleGuide, best.profile.styleGuide),
        config: {
          ...input.platform.config,
          stripMarkdown: best.profile.stripMarkdown,
          stripHtml: true,
          compactBlankLines: true,
          fixedTags: best.profile.fixedTags,
        },
      },
    }
  }

  return {
    provider: 'local-rules',
    confidence: 0.42,
    reasoning: [buildGenericReasoning(input)],
    platform: {
      ...input.platform,
      styleGuide: mergeStyleGuide(input.platform.styleGuide, '通用推断：保留清晰结构，压缩多余空行，标题突出内容价值，正文保留必要段落。'),
      config: {
        ...input.platform.config,
        stripHtml: true,
        compactBlankLines: true,
      },
    },
  }
}
