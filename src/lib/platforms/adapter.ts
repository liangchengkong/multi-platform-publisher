export interface PlatformConfig {
  appId?: string
  appSecret?: string
  accessToken?: string
  refreshToken?: string
  [key: string]: string | undefined
}

export interface PublishOptions {
  title: string
  content: string
  coverImage?: string
  tags?: string[]
  visibility?: 'public' | 'private'
}

export interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
  metadata?: Record<string, unknown>
}

export interface AdapterContext {
  config: PlatformConfig
  onTokenRefresh?: (newToken: string) => void
}

export interface PlatformAdapter {
  readonly name: string
  readonly displayName: string

  initialize(config: PlatformConfig): Promise<void>
  validateConfig(config: PlatformConfig): Promise<boolean>
  publish(options: PublishOptions): Promise<PublishResult>
  getOAuthUrl(): string
  handleOAuthCallback(code: string): Promise<PlatformConfig>
  transformContent(options: PublishOptions): PublishOptions
}

export abstract class BaseAdapter implements PlatformAdapter {
  abstract readonly name: string
  abstract readonly displayName: string

  protected config: PlatformConfig = {}
  protected accessToken: string | null = null

  async initialize(config: PlatformConfig): Promise<void> {
    this.config = config
    if (config.accessToken) {
      this.accessToken = config.accessToken
    }
  }

  async validateConfig(config: PlatformConfig): Promise<boolean> {
    return !!(config.appId && config.appSecret)
  }

  abstract publish(options: PublishOptions): Promise<PublishResult>
  abstract getOAuthUrl(): string
  abstract handleOAuthCallback(code: string): Promise<PlatformConfig>
  abstract transformContent(options: PublishOptions): PublishOptions

  protected abstract refreshAccessToken(): Promise<string>
}

export function detectPlatform(url: string): string | null {
  if (url.includes('mp.weixin.qq.com')) return 'wechat'
  if (url.includes('zhihu.com')) return 'zhihu'
  if (url.includes('bilibili.com')) return 'bilibili'
  if (url.includes('xiaohongshu.com')) return 'xiaohongshu'
  return null
}
