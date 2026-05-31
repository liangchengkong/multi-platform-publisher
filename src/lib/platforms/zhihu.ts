import { BaseAdapter, PlatformConfig, PublishOptions, PublishResult } from './adapter'

export class ZhihuAdapter extends BaseAdapter {
  readonly name = 'zhihu'
  readonly displayName = '知乎'

  private readonly API_BASE = 'https://api.zhihu.com'
  private readonly AUTHORIZE_URL = 'https://www.zhihu.com/oauth/authorize'

  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      if (!this.accessToken) {
        return { success: false, error: 'Access token not available. Please reconnect your account.' }
      }

      const response = await fetch(`${this.API_BASE}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          title: options.title,
          content: this.transformContent(options).content,
          tags: options.tags || [],
          cover_url: options.coverImage || ''
        })
      })

      const data = await response.json()

      if (data.error) {
        return { success: false, error: data.error.message || 'Failed to publish to Zhihu' }
      }

      return {
        success: true,
        platformPostId: data.id,
        platformUrl: data.url,
        metadata: { draft_id: data.id }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  getOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.appId || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zhihu/callback`,
      response_type: 'code',
      scope: 'content+user_info',
      state: 'zhihu'
    })
    return `${this.AUTHORIZE_URL}?${params.toString()}`
  }

  async handleOAuthCallback(code: string): Promise<PlatformConfig> {
    const response = await fetch(`${this.API_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.appId || '',
        client_secret: this.config.appSecret || '',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zhihu/callback`
      })
    })
    const data = await response.json()

    if (data.error) {
      throw new Error(data.error_description || 'Failed to get access token')
    }

    this.accessToken = data.access_token

    return {
      ...this.config,
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    }
  }

  transformContent(options: PublishOptions): PublishOptions {
    const processedContent = options.content
      .replace(/^### (.+)$/gm, '### $1')
      .replace(/^## (.+)$/gm, '## $1')
      .replace(/^# (.+)$/gm, '# $1')
      .replace(/<[^>]+>/g, '')

    return {
      ...options,
      content: processedContent
    }
  }

  protected async refreshAccessToken(): Promise<string> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error('Client ID and Secret are required')
    }

    const response = await fetch(`${this.API_BASE}/oauth/refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.appId || '',
        client_secret: this.config.appSecret || '',
        refresh_token: this.config.refreshToken || ''
      })
    })
    const data = await response.json()

    if (data.error) {
      throw new Error(data.error_description || 'Failed to refresh access token')
    }

    this.accessToken = data.access_token
    return data.access_token
  }
}