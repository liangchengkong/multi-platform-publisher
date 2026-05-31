import type { PlatformDetectionResult, PlatformInput } from './model'

interface PlatformTemplate {
  hostnames: string[]
  platform: PlatformInput
}

const platformTemplates: PlatformTemplate[] = [
  {
    hostnames: ['douyin.com', 'www.douyin.com'],
    platform: {
      name: 'douyin',
      displayName: '抖音',
      shortName: '抖音',
      description: '适合短视频文案、强钩子开头和话题标签传播。',
      colorClass: 'bg-orange-600',
      accentClass: 'border-orange-500 bg-orange-50 text-orange-800',
      maxTitleLength: 30,
      maxContentLength: 5000,
      requiredFields: ['标题', '正文', '话题'],
      styleGuide: '短句表达，开头突出看点，结尾补充话题标签。',
      config: {
        stripMarkdown: true,
        stripHtml: true,
        compactBlankLines: true,
        fixedTags: ['创作', '效率'],
        bodySuffix: '\n\n#创作 #效率',
      },
    },
  },
  {
    hostnames: ['weibo.com', 'www.weibo.com'],
    platform: {
      name: 'weibo',
      displayName: '微博',
      shortName: '微博',
      description: '适合短文本观点、热点表达和话题传播。',
      colorClass: 'bg-red-600',
      accentClass: 'border-red-500 bg-red-50 text-red-800',
      maxTitleLength: 30,
      maxContentLength: 2000,
      requiredFields: ['正文', '话题'],
      styleGuide: '压缩为短段落，突出观点和互动引导。',
      config: {
        stripMarkdown: true,
        stripHtml: true,
        compactBlankLines: true,
        fixedTags: ['创作', '观点'],
        bodySuffix: '\n\n#创作# #效率#',
      },
    },
  },
  {
    hostnames: ['toutiao.com', 'www.toutiao.com', 'mp.toutiao.com'],
    platform: {
      name: 'toutiao',
      displayName: '今日头条',
      shortName: '头条',
      description: '适合资讯型、观点型和实用经验类长文。',
      colorClass: 'bg-red-500',
      accentClass: 'border-red-400 bg-red-50 text-red-800',
      maxTitleLength: 30,
      maxContentLength: 20000,
      requiredFields: ['标题', '正文', '分类'],
      styleGuide: '标题明确，正文保留结构，开头快速说明价值。',
      config: {
        stripHtml: true,
        compactBlankLines: true,
        fixedTags: ['内容运营', '效率'],
      },
    },
  },
  {
    hostnames: ['juejin.cn', 'www.juejin.cn'],
    platform: {
      name: 'juejin',
      displayName: '掘金',
      shortName: '掘金',
      description: '适合技术文章、实践总结和开发经验沉淀。',
      colorClass: 'bg-blue-600',
      accentClass: 'border-blue-500 bg-blue-50 text-blue-800',
      maxTitleLength: 80,
      maxContentLength: 50000,
      requiredFields: ['标题', '正文', '分类', '标签'],
      styleGuide: '保留 Markdown 层级，突出问题、方案、代码和结论。',
      config: {
        stripHtml: true,
        compactBlankLines: true,
        fixedTags: ['技术', '实践'],
      },
    },
  },
  {
    hostnames: ['csdn.net', 'www.csdn.net', 'blog.csdn.net'],
    platform: {
      name: 'csdn',
      displayName: 'CSDN',
      shortName: 'CSDN',
      description: '适合技术教程、问题排查和知识库型文章。',
      colorClass: 'bg-rose-600',
      accentClass: 'border-rose-500 bg-rose-50 text-rose-800',
      maxTitleLength: 100,
      maxContentLength: 60000,
      requiredFields: ['标题', '正文', '分类', '标签'],
      styleGuide: '保留步骤结构，强调问题背景、解决过程和复盘。',
      config: {
        stripHtml: true,
        compactBlankLines: true,
        fixedTags: ['技术', '教程'],
      },
    },
  },
  {
    hostnames: ['medium.com', 'www.medium.com'],
    platform: {
      name: 'medium',
      displayName: 'Medium',
      shortName: 'Medium',
      description: '适合英文长文、观点文章和叙事型内容。',
      colorClass: 'bg-zinc-900',
      accentClass: 'border-zinc-500 bg-zinc-50 text-zinc-800',
      maxTitleLength: 100,
      maxContentLength: 50000,
      requiredFields: ['Title', 'Story', 'Tags'],
      styleGuide: '保留完整结构，使用清晰段落和自然叙事语气。',
      config: {
        stripHtml: true,
        compactBlankLines: true,
        fixedTags: ['Writing', 'Productivity'],
      },
    },
  },
]

function parseHostname(value: string) {
  try {
    const normalized = /^https?:\/\//.test(value.trim()) ? value.trim() : `https://${value.trim()}`
    return new URL(normalized).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function slugFromHostname(hostname: string) {
  const parts = hostname.split('.').filter(Boolean)
  return (parts.length > 1 ? parts[parts.length - 2] : parts[0] ?? 'custom-platform')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
}

function displayNameFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function makeFallbackPlatform(hostname: string): PlatformInput {
  const slug = slugFromHostname(hostname)
  const displayName = displayNameFromSlug(slug)

  return {
    name: slug,
    displayName,
    shortName: displayName,
    description: `根据 ${hostname} 自动生成的通用内容平台配置。`,
    colorClass: 'bg-slate-600',
    accentClass: 'border-slate-500 bg-slate-50 text-slate-800',
    maxTitleLength: 60,
    maxContentLength: 10000,
    requiredFields: ['标题', '正文'],
    styleGuide: '保留清晰结构，压缩多余空行，适合通用内容发布。',
    config: {
      stripHtml: true,
      stripMarkdown: false,
      compactBlankLines: true,
      fixedTags: ['创作'],
    },
  }
}

export function detectPlatformFromUrl(url: string): PlatformDetectionResult {
  const hostname = parseHostname(url)

  if (!hostname) {
    throw new Error('请输入有效的平台网址')
  }

  const template = platformTemplates.find((item) =>
    item.hostnames.some((candidate) => {
      const normalized = candidate.replace(/^www\./, '')
      return hostname === normalized || hostname.endsWith(`.${normalized}`)
    }),
  )

  if (template) {
    return {
      matched: true,
      source: 'template',
      hostname,
      platform: template.platform,
    }
  }

  return {
    matched: false,
    source: 'fallback',
    hostname,
    platform: makeFallbackPlatform(hostname),
  }
}
