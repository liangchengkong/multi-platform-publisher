import { BaseAdapter, PlatformConfig, PublishOptions, PublishResult } from './adapter'

export class WechatAdapter extends BaseAdapter {
  readonly name = 'wechat'
  readonly displayName = '微信公众号'

  private readonly API_BASE = 'https://api.weixin.qq.com'
  private readonly AUTHORIZE_URL = 'https://mp.weixin.qq.com'

  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      if (!this.accessToken) {
        return { success: false, error: 'Access token not available. Please reconnect your account.' }
      }

      const response = await fetch(`${this.API_BASE}/cgi-bin/draft/add?access_token=${this.accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: [{
            title: options.title,
            content: this.transformContent(options).content,
            thumb_media_id: options.coverImage,
            author: '',
            digest: options.content.slice(0, 54),
            need_open_comment: 1,
            only_fans_can_comment: 0
          }]
        })
      })

      const data = await response.json()

      if (data.errcode && data.errcode !== 0) {
        return { success: false, error: data.errmsg || 'Failed to publish to WeChat' }
      }

      return {
        success: true,
        platformPostId: data.media_id,
        platformUrl: `https://mp.weixin.qq.com/s/${data.media_id}`,
        metadata: { media_id: data.media_id }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  getOAuthUrl(): string {
    const params = new URLSearchParams({
      appid: this.config.appId || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/wechat/callback`,
      response_type: 'code',
      scope: 'snsapi_base',
      state: 'wechat'
    })
    return `${this.AUTHORIZE_URL}/oauth2/authorize?${params.toString()}#wechat_redirect`
  }

  async handleOAuthCallback(code: string): Promise<PlatformConfig> {
    const response = await fetch(`${this.API_BASE}/sns/oauth2/access_token?appid=${this.config.appId}&secret=${this.config.appSecret}&code=${code}&grant_type=authorization_code`)
    const data = await response.json()

    if (data.errcode) {
      throw new Error(data.errmsg || 'Failed to get access token')
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
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')

    return {
      ...options,
      content: processedContent
    }
  }

  protected async refreshAccessToken(): Promise<string> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error('AppID and AppSecret are required')
    }

    const response = await fetch(
      `${this.API_BASE}/cgi-bin/token?grant_type=client_credential&appid=${this.config.appId}&secret=${this.config.appSecret}`
    )
    const data = await response.json()

    if (data.errcode) {
      throw new Error(data.errmsg || 'Failed to refresh access token')
    }

    this.accessToken = data.access_token
    return data.access_token
  }
}