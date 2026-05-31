import type { PlatformAdapter } from './adapter'
import { BilibiliAdapter } from './bilibili'
import { WechatAdapter } from './wechat'
import { XiaohongshuAdapter } from './xiaohongshu'
import { ZhihuAdapter } from './zhihu'

export function createAdapter(platformName: string): PlatformAdapter {
  switch (platformName) {
    case 'wechat':
      return new WechatAdapter()
    case 'zhihu':
      return new ZhihuAdapter()
    case 'bilibili':
      return new BilibiliAdapter()
    case 'xiaohongshu':
      return new XiaohongshuAdapter()
    default:
      throw new Error(`Unknown platform: ${platformName}`)
  }
}
