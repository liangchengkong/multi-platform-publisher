import type { AdaptedContent, PlatformDefinition, PublishRecord } from './model'

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export async function simulatePublish(content: AdaptedContent, platform: PlatformDefinition): Promise<PublishRecord> {
  await wait(280)

  const failed = content.title.trim().length === 0 || content.body.trim().length === 0
  const publishedAt = new Date().toISOString()

  return {
    id: `${platform.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    platformId: platform.id,
    platformName: platform.displayName,
    title: content.title,
    status: failed ? 'failed' : 'success',
    message: failed ? '模拟发布失败：标题和正文不能为空。' : '模拟发布成功，未调用真实平台 API。',
    publishedAt,
    simulatedUrl: failed ? undefined : `https://example.local/${platform.id}/${encodeURIComponent(content.title)}`,
  }
}
