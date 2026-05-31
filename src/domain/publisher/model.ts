export type BuiltInPlatformId = 'wechat' | 'zhihu' | 'bilibili' | 'xiaohongshu'
export type PlatformId = string
export type PlatformSource = 'builtin' | 'custom'

export type PublishStatus = 'success' | 'failed'

export interface ConfigurableAdapterConfig {
  titlePrefix?: string
  titleSuffix?: string
  bodyPrefix?: string
  bodySuffix?: string
  stripMarkdown?: boolean
  stripHtml?: boolean
  compactBlankLines?: boolean
  fixedTags?: string[]
}

export interface PlatformDefinition {
  id: PlatformId
  displayName: string
  shortName: string
  colorClass: string
  accentClass: string
  description: string
  source: PlatformSource
  maxTitleLength: number
  maxContentLength: number
  requiredFields: string[]
  styleGuide: string
  enabled: boolean
  config?: ConfigurableAdapterConfig
}

export interface SourceContent {
  id: string
  title: string
  body: string
  updatedAt: string
}

export interface AdaptedContent {
  id?: string
  platformId: PlatformId
  title: string
  body: string
  tags: string[]
  warnings: string[]
  updatedAt: string
}

export interface PublishRecord {
  id: string
  platformId: PlatformId
  platformName: string
  title: string
  status: PublishStatus
  message: string
  publishedAt: string
  simulatedUrl?: string
}

export interface WorkspaceState {
  source: SourceContent
  platforms: PlatformDefinition[]
  selectedPlatformIds: PlatformId[]
  adapted: Record<PlatformId, AdaptedContent>
  records: PublishRecord[]
}

export interface ContentAdapter {
  platformId: PlatformId
  adapt(source: SourceContent): AdaptedContent
}
