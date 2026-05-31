import { BaseAdapter, PlatformConfig, PublishOptions, PublishResult } from './adapter'

export class XiaohongshuAdapter extends BaseAdapter {
  readonly name = 'xiaohongshu'
  readonly displayName = '小红书'

  private readonly API_BASE = 'https://api.xiaohongshu.com'
  private readonly AUTHORIZE_URL = 'https://www.xiaohongshu.com'

  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      if (!this.accessToken) {
        return { success: false, error: 'Access token not available. Please reconnect your account.' }
      }

      const response = await fetch(`${this.API_BASE}/api/v2/note/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          title: options.title,
          description: this.transformContent(options).content,
          image_urls: options.coverImage ? [options.coverImage] : [],
          tags: options.tags || [],
          visibility: options.visibility || 'public'
        })
      })

      const data = await response.json()

      if (data.error_code) {
        return { success: false, error: data.error_msg || 'Failed to publish to Xiaohongshu' }
      }

      return {
        success: true,
        platformPostId: data.note_id,
        platformUrl: `https://www.xiaohongshu.com/explore/${data.note_id}`,
        metadata: { note_id: data.note_id }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  getOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.appId || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/xiaohongshu/callback`,
      response_type: 'code',
      scope: 'content+user_info',
      state: 'xiaohongshu'
    })
    return `${this.AUTHORIZE_URL}/oauth2/authorize?${params.toString()}`
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
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/xiaohongshu/callback`
      })
    })
    const data = await response.json()

    if (data.error_code) {
      throw new Error(data.error_msg || 'Failed to get access token')
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
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')

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

    if (data.error_code) {
      throw new Error(data.error_msg || 'Failed to refresh access token')
    }

    this.accessToken = data.access_token
    return data.access_token
  }
}