import type { AdaptedContent, BuiltInPlatformId, ContentAdapter, PlatformDefinition, SourceContent } from './model'
import { defaultPlatforms, isBuiltInPlatformId } from '@/domain/platforms/builtin'

function now() {
  return new Date().toISOString()
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, '')
}

function stripMarkdown(value: string) {
  return stripHtml(value)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
}

function markdownToWechatHtml(value: string) {
  return value
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br />')
}

function compactParagraphs(value: string) {
  return value.replace(/\n{3,}/g, '\n\n').trim()
}

function extractTags(source: SourceContent) {
  const text = `${source.title} ${source.body}`
  const tags = ['创作', '内容运营']
  if (/AI|人工智能|自动化/i.test(text)) tags.push('AI工具')
  if (/效率|流程|工作流/.test(text)) tags.push('效率工具')
  if (/发布|平台|账号/.test(text)) tags.push('多平台发布')
  return Array.from(new Set(tags)).slice(0, 5)
}

function makeWarnings(title: string, body: string, titleLimit: number, bodyLimit: number) {
  const warnings: string[] = []
  if (title.length > titleLimit) warnings.push(`标题超过 ${titleLimit} 字，建议压缩。`)
  if (body.length > bodyLimit) warnings.push(`正文超过 ${bodyLimit} 字，建议删减后再发布。`)
  return warnings
}

function truncate(value: string, limit: number) {
  if (value.length <= limit) return value
  return `${value.slice(0, Math.max(0, limit - 3))}...`
}

const builtInAdapters: Record<BuiltInPlatformId, ContentAdapter> = {
  wechat: {
    platformId: 'wechat',
    adapt(source) {
      const body = `<p>${markdownToWechatHtml(source.body)}</p>`
      return {
        platformId: 'wechat',
        title: source.title,
        body,
        tags: extractTags(source).slice(0, 3),
        warnings: makeWarnings(source.title, body, 64, 20000),
        updatedAt: now(),
      }
    },
  },
  zhihu: {
    platformId: 'zhihu',
    adapt(source) {
      const body = compactParagraphs(stripHtml(source.body))
      const title = source.title.endsWith('？') || source.title.endsWith('?') ? source.title : `${source.title}：我的实践总结`
      return {
        platformId: 'zhihu',
        title,
        body: `## 核心观点\n\n${body}\n\n## 结论\n\n以上是这次实践中最值得复用的部分。`,
        tags: extractTags(source),
        warnings: makeWarnings(title, body, 80, 50000),
        updatedAt: now(),
      }
    },
  },
  bilibili: {
    platformId: 'bilibili',
    adapt(source) {
      const body = compactParagraphs(stripHtml(source.body)).replace(/^# /gm, '## ')
      const title = source.title.length > 36 ? `${source.title.slice(0, 36)}...` : source.title
      return {
        platformId: 'bilibili',
        title,
        body: `${body}\n\n---\n适合收藏的要点已经整理完毕，欢迎在评论区补充你的做法。`,
        tags: extractTags(source).slice(0, 4),
        warnings: makeWarnings(title, body, 40, 12000),
        updatedAt: now(),
      }
    },
  },
  xiaohongshu: {
    platformId: 'xiaohongshu',
    adapt(source) {
      const plain = stripMarkdown(source.body)
      const summary = plain.length > 620 ? `${plain.slice(0, 620)}...` : plain
      const tags = extractTags(source)
      const title = source.title.length > 18 ? `${source.title.slice(0, 18)}...` : source.title
      const body = `${summary}\n\n${tags.map((tag) => `#${tag}`).join(' ')}`
      return {
        platformId: 'xiaohongshu',
        title,
        body,
        tags,
        warnings: makeWarnings(title, body, 20, 1000),
        updatedAt: now(),
      }
    },
  },
}

export function adaptForConfigurablePlatform(source: SourceContent, platform: PlatformDefinition): AdaptedContent {
  const config = platform.config ?? {}
  let title = `${config.titlePrefix ?? ''}${source.title}${config.titleSuffix ?? ''}`
  let body = source.body

  if (config.stripHtml) body = stripHtml(body)
  if (config.stripMarkdown) body = stripMarkdown(body)
  if (config.compactBlankLines) body = compactParagraphs(body)

  body = `${config.bodyPrefix ?? ''}${body}${config.bodySuffix ?? ''}`
  title = truncate(title, platform.maxTitleLength)

  const tags = (config.fixedTags?.length ? config.fixedTags : extractTags(source)).slice(0, 8)

  return {
    platformId: platform.id,
    title,
    body,
    tags,
    warnings: makeWarnings(title, body, platform.maxTitleLength, platform.maxContentLength),
    updatedAt: now(),
  }
}

export function adaptForPlatform(source: SourceContent, platform: PlatformDefinition): AdaptedContent {
  if (platform.source === 'builtin' && isBuiltInPlatformId(platform.id)) {
    return builtInAdapters[platform.id].adapt(source)
  }

  return adaptForConfigurablePlatform(source, platform)
}

export function adaptForAllPlatforms(
  source: SourceContent,
  platforms: PlatformDefinition[] = defaultPlatforms,
): Record<string, AdaptedContent> {
  return platforms.reduce(
    (result, platform) => ({
      ...result,
      [platform.id]: adaptForPlatform(source, platform),
    }),
    {} as Record<string, AdaptedContent>,
  )
}
