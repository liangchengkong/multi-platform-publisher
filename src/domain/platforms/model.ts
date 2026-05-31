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
