import type { PlatformInput, PlatformSampleAnalysisResult, PlatformSampleMetrics } from './model'

interface ParsedSample {
  title: string
  content: string
  paragraphs: string[]
  hashtags: string[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length)
}

function parseSample(sample: string): ParsedSample {
  const lines = sample
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
  const nonEmptyLines = lines.filter(Boolean)
  const title = (nonEmptyLines[0] ?? '').replace(/^#{1,6}\s*/, '').trim()
  const content = nonEmptyLines.slice(1).join('\n')
  const paragraphs = sample
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
  const hashtags = Array.from(sample.matchAll(/#[\p{L}\p{N}_-]+/gu)).map((match) => match[0])

  return {
    title,
    content: content || sample.trim(),
    paragraphs,
    hashtags,
  }
}

function hasMarkdownSyntax(samples: string[]) {
  return samples.some((sample) => /(^#{1,6}\s)|(```)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(^[-*]\s)/m.test(sample))
}

function mostFrequentTags(samples: ParsedSample[]) {
  const counts = new Map<string, number>()

  for (const sample of samples) {
    for (const hashtag of sample.hashtags) {
      const normalized = hashtag.replace(/^#/, '').trim()
      if (!normalized) continue
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([tag]) => tag)
}

function buildStyleSuggestions(metrics: PlatformSampleMetrics) {
  const suggestions: string[] = []

  if (metrics.averageContentLength <= 800) {
    suggestions.push('样例偏短文案，适合压缩表达、突出开头钩子和行动引导。')
  } else if (metrics.averageContentLength >= 3000) {
    suggestions.push('样例偏长文，适合保留标题层级、论证结构和完整段落。')
  } else {
    suggestions.push('样例为中等长度内容，适合保留清晰段落并压缩冗余表达。')
  }

  if (metrics.averageParagraphLength <= 80) {
    suggestions.push('段落较短，建议压缩多余空行并保持轻量阅读节奏。')
  } else {
    suggestions.push('段落较长，建议保留段落结构并用小标题增强可读性。')
  }

  if (metrics.hashtagCount > 0) {
    suggestions.push('样例包含话题标签，建议保留固定标签和结尾话题区。')
  }

  if (metrics.hasMarkdown) {
    suggestions.push('样例包含 Markdown 结构，建议保留标题、列表或代码块层级。')
  }

  return suggestions
}

export function analyzePlatformSamples(platform: PlatformInput, samples: string[]): PlatformSampleAnalysisResult {
  const normalizedSamples = samples.map((sample) => sample.trim()).filter(Boolean)

  if (normalizedSamples.length === 0) {
    throw new Error('请提供至少一条样例内容')
  }

  const parsedSamples = normalizedSamples.map(parseSample)
  const titleLengths = parsedSamples.map((sample) => sample.title.length).filter((length) => length > 0)
  const contentLengths = parsedSamples.map((sample) => sample.content.length)
  const paragraphLengths = parsedSamples.flatMap((sample) => sample.paragraphs.map((paragraph) => paragraph.length))
  const tags = mostFrequentTags(parsedSamples)
  const metrics: PlatformSampleMetrics = {
    sampleCount: parsedSamples.length,
    averageTitleLength: average(titleLengths),
    averageContentLength: average(contentLengths),
    averageParagraphLength: average(paragraphLengths),
    hashtagCount: parsedSamples.reduce((total, sample) => total + sample.hashtags.length, 0),
    hasMarkdown: hasMarkdownSyntax(normalizedSamples),
  }
  const suggestions = buildStyleSuggestions(metrics)
  const nextStyleGuide = `${platform.styleGuide}\n${suggestions.join('\n')}`.trim()
  const nextMaxTitleLength = metrics.averageTitleLength > 0
    ? clamp(Math.ceil(metrics.averageTitleLength * 1.5), 20, platform.maxTitleLength)
    : platform.maxTitleLength
  const nextMaxContentLength = metrics.averageContentLength > 0
    ? Math.max(platform.maxContentLength, Math.ceil(metrics.averageContentLength * 1.5), 2000)
    : platform.maxContentLength

  return {
    metrics,
    suggestions,
    platform: {
      ...platform,
      maxTitleLength: nextMaxTitleLength,
      maxContentLength: nextMaxContentLength,
      styleGuide: nextStyleGuide,
      config: {
        ...platform.config,
        compactBlankLines: true,
        stripMarkdown: metrics.hasMarkdown ? false : (platform.config.stripMarkdown ?? true),
        fixedTags: tags.length > 0 ? tags : platform.config.fixedTags,
      },
    },
  }
}
