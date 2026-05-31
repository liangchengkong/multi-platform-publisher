import type { ConfigurableAdapterConfig, PlatformDefinition } from '@/domain/publisher/model'

export interface PlatformInput {
  name: string
  displayName: string
  shortName: string
  description: string
  colorClass: string
  accentClass: string
  maxTitleLength: number
  maxContentLength: number
  requiredFields: string[]
  styleGuide: string
  config: ConfigurableAdapterConfig
}

export type PlatformView = PlatformDefinition

export type PlatformDetectionSource = 'template' | 'fallback'

export interface PlatformDetectionResult {
  matched: boolean
  source: PlatformDetectionSource
  hostname: string
  platform: PlatformInput
}

export interface PlatformSampleMetrics {
  sampleCount: number
  averageTitleLength: number
  averageContentLength: number
  averageParagraphLength: number
  hashtagCount: number
  hasMarkdown: boolean
}

export interface PlatformSampleAnalysisResult {
  metrics: PlatformSampleMetrics
  suggestions: string[]
  platform: PlatformInput
}

export type PlatformInferenceProvider = 'local-rules' | 'ai'

export type PlatformContentType =
  | 'long_article'
  | 'short_post'
  | 'video_description'
  | 'qa_answer'
  | 'technical_article'
  | 'product_note'

export type PlatformStylePreference =
  | 'professional'
  | 'conversational'
  | 'short_sentences'
  | 'long_form'
  | 'with_hashtags'
  | 'preserve_markdown'
  | 'strip_markdown'

export interface PlatformInferenceContext {
  platformName?: string
  contentType?: PlatformContentType
  officialRulesUrl?: string
  knownRules?: string
  targetStyles?: PlatformStylePreference[]
}

export interface PlatformInferenceResult {
  provider: PlatformInferenceProvider
  confidence: number
  reasoning: string[]
  platform: PlatformInput
}
