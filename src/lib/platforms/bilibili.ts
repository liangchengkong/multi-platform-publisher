import { BaseAdapter, PlatformConfig, PublishOptions, PublishResult } from './adapter'

export class BilibiliAdapter extends BaseAdapter {
  readonly name = 'bilibili'
  readonly displayName = 'B站'

  private readonly API_BASE = 'https://api.bilibili.com'
  private readonly AUTHORIZE_URL = 'https://api.bilibili.com'

  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      if (!this.accessToken) {
        return { success: false, error: 'Access token not available. Please reconnect your account.' }
      }

      const response = await fetch(`${this.API_BASE}/v2/article/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: new URLSearchParams({
          title: options.title,
          content: this.transformContent(options).content,
          cover: options.coverImage || '',
          tags: (options.tags || []).join(','),
          category_id: '0'
        })
      })

      const data = await response.json()

      if (data.code !== 0) {
        return { success: false, error: data.message || 'Failed to publish to Bilibili' }
      }

      return {
        success: true,
        platformPostId: String(data.data.article_id),
        platformUrl: `https://www.bilibili.com/read/cv${data.data.article_id}`,
        metadata: { article_id: data.data.article_id }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  getOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.appId || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/bilibili/callback`,
      response_type: 'code',
      scope: 'content',
      state: 'bilibili'
    })
    return `${this.AUTHORIZE_URL}/oauth2/authorize?${params.toString()}`
  }

  async handleOAuthCallback(code: string): Promise<PlatformConfig> {
    const response = await fetch(`${this.API_BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.appId || '',
        client_secret: this.config.appSecret || '',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/bilibili/callback`
      })
    })
    const data = await response.json()

    if (data.code !== 0) {
      throw new Error(data.message || 'Failed to get access token')
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
      .replace(/\n\n/g, '\n')

    return {
      ...options,
      content: processedContent
    }
  }

  protected async refreshAccessToken(): Promise<string> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error('Client ID and Secret are required')
    }

    const response = await fetch(`${this.API_BASE}/oauth2/refresh_token`, {
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

    if (data.code !== 0) {
      throw new Error(data.message || 'Failed to refresh access token')
    }

    this.accessToken = data.access_token
    return data.access_token
  }
}