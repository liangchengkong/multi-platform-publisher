import type { PlatformId, PublishRecord } from '@/domain/publisher/model'
import { prisma } from '@/lib/db'

interface SimulatePublishInput {
  contentId: string
  platformIds: PlatformId[]
}

export async function simulatePublishToPlatforms(input: SimulatePublishInput): Promise<PublishRecord[]> {
  const content = await prisma.content.findUnique({
    where: { id: input.contentId },
  })

  if (!content) {
    throw new Error('Content not found')
  }

  const platforms = await prisma.platform.findMany({
    where: {
      name: { in: input.platformIds },
      enabled: true,
    },
  })

  const task = await prisma.publishTask.create({
    data: {
      contentId: input.contentId,
      mode: 'simulate',
      status: 'running',
      platformCount: platforms.length,
      successCount: 0,
      failedCount: 0,
      startedAt: new Date(),
    },
  })

  const records: PublishRecord[] = []

  for (const platform of platforms) {
    const adapted = await prisma.adaptedContent.findUnique({
      where: {
        contentId_platformId: {
          contentId: input.contentId,
          platformId: platform.id,
        },
      },
    })

    const failed = !adapted?.title?.trim() || !adapted?.body?.trim()
    const publishedAt = new Date()
    const publishedTitle = adapted?.title ?? content.title

    const record = await prisma.publishRecord.create({
      data: {
        taskId: task.id,
        contentId: input.contentId,
        platformId: platform.id,
        adaptedContentId: adapted?.id,
        status: failed ? 'failed' : 'success',
        message: failed ? '模拟发布失败：标题和正文不能为空。' : '模拟发布成功，未调用真实平台 API。',
        platformPostId: failed ? null : `mock_${platform.name}_${Date.now()}`,
        platformUrl: failed ? null : `https://example.local/${platform.name}/${encodeURIComponent(publishedTitle)}`,
        requestSnapshot: JSON.stringify({ mode: 'simulate', platformId: platform.name }),
        responseSnapshot: JSON.stringify({ success: !failed }),
        publishedAt: failed ? null : publishedAt,
      },
      include: {
        platform: true,
        adaptedContent: true,
      },
    })

    records.push({
      id: record.id,
      platformId: platform.name,
      platformName: record.platform.displayName,
      title: record.adaptedContent?.title ?? content.title,
      status: record.status === 'success' ? 'success' : 'failed',
      message: record.message,
      publishedAt: (record.publishedAt ?? record.createdAt).toISOString(),
      simulatedUrl: record.platformUrl ?? undefined,
    })
  }

  const successCount = records.filter((record) => record.status === 'success').length
  const failedCount = records.length - successCount

  await prisma.publishTask.update({
    where: { id: task.id },
    data: {
      status: failedCount === 0 ? 'success' : successCount > 0 ? 'partial_failed' : 'failed',
      successCount,
      failedCount,
      finishedAt: new Date(),
    },
  })

  return records
}

export async function clearPublishRecordsForContent(contentId: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { id: true },
  })

  if (!content) {
    throw new Error('Content not found')
  }

  await prisma.$transaction(async (tx) => {
    await tx.publishRecord.deleteMany({
      where: { contentId },
    })
    await tx.publishTask.deleteMany({
      where: { contentId },
    })
  })

  return { deleted: true }
}
