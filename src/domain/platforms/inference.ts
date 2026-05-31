import type {
  PlatformContentType,
  PlatformInferenceContext,
  PlatformInferenceResult,
  PlatformInput,
  PlatformStylePreference,
} from './model'

interface PlatformInferenceInput {
  platform: PlatformInput
  description?: string
  samples?: string[]
  context?: PlatformInferenceContext
}

interface InferenceProfile {
  contentTypes: PlatformContentType[]
  keywords: string[]
  titleLength: number
  contentLength: number
  styleGuide: string
  fixedTags: string[]
  stripMarkdown: boolean
  reasoning: string
}

const contentTypeLabels: Record<PlatformContentType, string> = {
  long_article: '图文长文',
  short_post: '短文动态',
  video_description: '视频简介',
  qa_answer: '问答回答',
  technical_article: '技术文章',
  product_note: '商品种草笔记',
}

const styleLabels: Record<PlatformStylePreference, string> = {
  professional: '专业克制',
  conversational: '口语化',
  short_sentences: '短句表达',
  long_form: '长文结构',
  with_hashtags: '保留话题标签',
  preserve_markdown: '保留 Markdown',
  strip_markdown: '去掉 Markdown',
}

const profiles: InferenceProfile[] = [
  {
    contentTypes: ['video_description', 'product_note'],
    keywords: ['短视频', '视频', '种草', '生活', '娱乐', '口播', '脚本', 'video', 'shorts', 'reels'],
    titleLength: 30,
    contentLength: 5000,
    styleGuide: '偏短文案表达，开头需要强钩子，正文适合短句和话题标签。',
    fixedTags: ['创作', '短视频'],
    stripMarkdown: true,
    reasoning: '目标内容接近短视频/种草场景，适合短标题、短段落和话题化表达。',
  },
  {
    contentTypes: ['short_post'],
    keywords: ['社区', '动态', '微博', '社交', '热点', '讨论', 'community', 'social', 'feed'],
    titleLength: 30,
    contentLength: 2000,
    styleGuide: '偏社交动态表达，适合压缩观点、保留互动引导和话题标签。',
    fixedTags: ['观点', '讨论'],
    stripMarkdown: true,
    reasoning: '目标内容接近社区动态，适合轻量短内容和互动语气。',
  },
  {
    contentTypes: ['technical_article'],
    keywords: ['技术', '开发', '编程', '代码', '工程', '教程', '知识库', 'code', 'dev', 'developer', 'engineering', 'tutorial', 'programming'],
    titleLength: 80,
    contentLength: 50000,
    styleGuide: '偏技术长文表达，适合保留 Markdown 层级、代码块、步骤和结论。',
    fixedTags: ['技术', '实践'],
    stripMarkdown: false,
    reasoning: '目标内容接近技术文章，适合保留结构化 Markdown 和较长正文。',
  },
  {
    contentTypes: ['long_article', 'qa_answer'],
    keywords: ['长文', '专栏', '观点', '深度', '分析', '博客', '问答', '回答', 'blog', 'article', 'essay', 'column', 'qa'],
    titleLength: 80,
    contentLength: 30000,
    styleGuide: '偏长文专栏表达，适合保留论证结构、段落层级和完整上下文。',
    fixedTags: ['观点', '分析'],
    stripMarkdown: false,
    reasoning: '目标内容接近长文或问答，适合更长正文和结构化表达。',
  },
  {
    contentTypes: ['long_article'],
    keywords: ['英文', '海外', 'international', 'english', 'medium', 'newsletter'],
    titleLength: 100,
    contentLength: 50000,
    styleGuide: '偏英文长文表达，适合自然叙事语气、清晰段落和少量标签。',
    fixedTags: ['Writing', 'Productivity'],
    stripMarkdown: false,
    reasoning: '上下文体现英文或海外内容平台属性，适合长标题和英文写作标签。',
  },
]

function normalizeText(input: PlatformInferenceInput) {
  const context = input.context

  return [
    input.platform.displayName,
    input.platform.description,
    input.platform.styleGuide,
    input.description ?? '',
    context?.platformName ?? '',
    context?.officialRulesUrl ?? '',
    context?.knownRules ?? '',
    context?.contentType ? contentTypeLabels[context.contentType] : '',
    ...(context?.targetStyles ?? []).map((style) => styleLabels[style]),
    ...(input.samples ?? []),
  ]
    .join('\n')
    .toLowerCase()
}

function scoreProfile(input: PlatformInferenceInput, text: string, profile: InferenceProfile) {
  const keywordScore = profile.keywords.reduce((score, keyword) => score + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0)
  const contentTypeScore = input.context?.contentType && profile.contentTypes.includes(input.context.contentType) ? 4 : 0

  return keywordScore + contentTypeScore
}

function mergeStyleGuide(current: string, inferred: string) {
  if (current.includes(inferred)) return current
  return `${current}\n${inferred}`.trim()
}

function applyKnownRules(platform: PlatformInput, knownRules?: string) {
  if (!knownRules?.trim()) return { platform, reasoning: [] as string[] }

  const reasoning: string[] = []
  const titleMatch = knownRules.match(/(?:标题|title)[^\d]{0,20}(\d+)\s*(?:字|chars?|characters?)?/i)
  const contentMatch = knownRules.match(/(?:正文|内容|body|content)[^\d]{0,20}(\d+)\s*(?:字|chars?|characters?)?/i)
  const tagMatch = knownRules.match(/(?:标签|话题|tags?|hashtags?)[^\d]{0,20}(\d+)\s*(?:个|枚|条|items?)?/i)
  const requiredFields = new Set(platform.requiredFields)

  let nextPlatform = { ...platform }

  if (titleMatch?.[1]) {
    nextPlatform = { ...nextPlatform, maxTitleLength: Number(titleMatch[1]) }
    reasoning.push(`已根据已知限制设置标题上限为 ${titleMatch[1]} 字。`)
  }

  if (contentMatch?.[1]) {
    nextPlatform = { ...nextPlatform, maxContentLength: Number(contentMatch[1]) }
    reasoning.push(`已根据已知限制设置正文上限为 ${contentMatch[1]} 字。`)
  }

  if (tagMatch?.[1]) {
    requiredFields.add('标签')
    reasoning.push(`已识别标签/话题数量限制：最多 ${tagMatch[1]} 个。`)
  }

  if (/(封面|cover)/i.test(knownRules)) requiredFields.add('封面')
  if (/(分类|category)/i.test(knownRules)) requiredFields.add('分类')
  if (/(摘要|summary|excerpt)/i.test(knownRules)) requiredFields.add('摘要')

  nextPlatform = {
    ...nextPlatform,
    requiredFields: Array.from(requiredFields),
    styleGuide: mergeStyleGuide(nextPlatform.styleGuide, `用户提供的平台限制：${knownRules.trim()}`),
  }

  return { platform: nextPlatform, reasoning }
}

function styleGuideFromPreferences(styles: PlatformStylePreference[] = []) {
  const rules: string[] = []

  if (styles.includes('professional')) rules.push('语气保持专业克制，减少夸张表达。')
  if (styles.includes('conversational')) rules.push('语气可以更口语化，适合轻量阅读。')
  if (styles.includes('short_sentences')) rules.push('正文尽量使用短句和短段落。')
  if (styles.includes('long_form')) rules.push('保留完整长文结构，使用小标题组织内容。')
  if (styles.includes('with_hashtags')) rules.push('结尾保留话题标签区域。')
  if (styles.includes('preserve_markdown')) rules.push('保留 Markdown 标题、列表和代码块。')
  if (styles.includes('strip_markdown')) rules.push('去掉 Markdown 标记，输出纯文本。')

  return rules
}

function applyStylePreferences(platform: PlatformInput, styles: PlatformStylePreference[] = []) {
  const rules = styleGuideFromPreferences(styles)
  const hasPreserveMarkdown = styles.includes('preserve_markdown')
  const hasStripMarkdown = styles.includes('strip_markdown')
  const hasHashtags = styles.includes('with_hashtags')

  return {
    ...platform,
    styleGuide: rules.reduce((current, rule) => mergeStyleGuide(current, rule), platform.styleGuide),
    config: {
      ...platform.config,
      stripMarkdown: hasPreserveMarkdown ? false : hasStripMarkdown ? true : platform.config.stripMarkdown,
      fixedTags: hasHashtags ? (platform.config.fixedTags?.length ? platform.config.fixedTags : ['创作']) : platform.config.fixedTags,
    },
  }
}

function buildContextReasoning(input: PlatformInferenceInput) {
  const reasoning: string[] = []
  const context = input.context

  if (context?.contentType) reasoning.push(`已按“${contentTypeLabels[context.contentType]}”内容类型调整基础规则。`)
  if (context?.officialRulesUrl) reasoning.push('已记录官方规则链接，当前版本不抓取网页内容，规则仍以用户填写和样例分析为准。')
  if (context?.targetStyles?.length) reasoning.push(`已合并目标风格：${context.targetStyles.map((style) => styleLabels[style]).join('、')}。`)

  return reasoning
}

function buildGenericReasoning(input: PlatformInferenceInput) {
  const context = input.context
  const hasKnownRules = Boolean(context?.knownRules?.trim())
  const hasSamples = (input.samples ?? []).some((sample) => sample.trim())

  if (hasKnownRules && hasSamples) {
    return '未匹配到明确平台画像，已结合已知限制和样例内容生成通用适配建议。'
  }

  if (hasKnownRules) {
    return '未匹配到明确平台画像，已根据用户填写的已知限制生成通用适配建议。'
  }

  if (hasSamples) {
    return '未匹配到明确平台画像，已根据样例内容生成通用适配建议。'
  }

  return '上下文不足，保留通用平台配置。'
}

export function inferPlatformConfig(input: PlatformInferenceInput): PlatformInferenceResult {
  const text = normalizeText(input)
  const rankedProfiles = profiles
    .map((profile) => ({ profile, score: scoreProfile(input, text, profile) }))
    .sort((left, right) => right.score - left.score)
  const best = rankedProfiles[0]
  const knownRulesResult = applyKnownRules(input.platform, input.context?.knownRules)
  const basePlatform = applyStylePreferences(knownRulesResult.platform, input.context?.targetStyles)
  const contextReasoning = buildContextReasoning(input)
  const hasExplicitTitleLimit = /(?:标题|title)[^\d]{0,20}\d+\s*(?:字|chars?|characters?)?/i.test(input.context?.knownRules ?? '')
  const hasExplicitContentLimit = /(?:正文|内容|body|content)[^\d]{0,20}\d+\s*(?:字|chars?|characters?)?/i.test(input.context?.knownRules ?? '')

  if (best && best.score > 0) {
    return {
      provider: 'local-rules',
      confidence: Math.min(0.94, 0.52 + best.score * 0.08),
      reasoning: [best.profile.reasoning, ...knownRulesResult.reasoning, ...contextReasoning],
      platform: {
        ...basePlatform,
        displayName: input.context?.platformName?.trim() || basePlatform.displayName,
        shortName: input.context?.platformName?.trim() || basePlatform.shortName,
        maxTitleLength: hasExplicitTitleLimit ? basePlatform.maxTitleLength : Math.max(basePlatform.maxTitleLength, best.profile.titleLength),
        maxContentLength: hasExplicitContentLimit ? basePlatform.maxContentLength : Math.max(basePlatform.maxContentLength, best.profile.contentLength),
        styleGuide: mergeStyleGuide(basePlatform.styleGuide, best.profile.styleGuide),
        config: {
          ...basePlatform.config,
          stripMarkdown: basePlatform.config.stripMarkdown ?? best.profile.stripMarkdown,
          stripHtml: true,
          compactBlankLines: true,
          fixedTags: basePlatform.config.fixedTags?.length ? basePlatform.config.fixedTags : best.profile.fixedTags,
        },
      },
    }
  }

  return {
    provider: 'local-rules',
    confidence: 0.46,
    reasoning: [buildGenericReasoning(input), ...knownRulesResult.reasoning, ...contextReasoning],
    platform: {
      ...basePlatform,
      displayName: input.context?.platformName?.trim() || basePlatform.displayName,
      shortName: input.context?.platformName?.trim() || basePlatform.shortName,
      styleGuide: mergeStyleGuide(basePlatform.styleGuide, '通用推断：保留清晰结构，压缩多余空行，标题突出内容价值，正文保留必要段落。'),
      config: {
        ...basePlatform.config,
        stripHtml: true,
        compactBlankLines: true,
      },
    },
  }
}
