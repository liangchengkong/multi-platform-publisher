import { adaptForAllPlatforms } from '@/domain/publisher/adapters'
import type { AdaptedContent, PublishRecord, WorkspaceState } from '@/domain/publisher/model'
import { defaultPlatforms } from '@/domain/platforms/builtin'
import { createSeedSource, createSeedWorkspace } from '@/domain/publisher/storage'
import { prisma } from '@/lib/db'
import { listPlatformDefinitions } from '@/server/platforms/platforms.service'

function parseStringArray(value: string | null | undefined) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export async function getWorkspaceState(): Promise<WorkspaceState> {
  const content = await prisma.content.findFirst({
    orderBy: { updatedAt: 'desc' },
  })

  if (!content) {
    return createSeedWorkspace()
  }

  const platforms = await listPlatformDefinitions()
  const [adaptedRows, recordRows] = await Promise.all([
    prisma.adaptedContent.findMany({
      where: { contentId: content.id },
      include: { platform: true },
    }),
    prisma.publishRecord.findMany({
      where: { contentId: content.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        platform: true,
        adaptedContent: true,
      },
    }),
  ])

  const source = {
    id: content.id,
    title: content.title,
    body: content.body,
    updatedAt: content.updatedAt.toISOString(),
  }
  const fallbackAdapted = adaptForAllPlatforms(source, platforms)

  const adapted = platforms.reduce(
    (result, platform) => {
      const row = adaptedRows.find((item) => item.platform.name === platform.id)
      const fallback = fallbackAdapted[platform.id]

      result[platform.id] = row
        ? {
            id: row.id,
            platformId: platform.id,
            title: row.title,
            body: row.body,
            tags: parseStringArray(row.tags),
            warnings: parseStringArray(row.warnings),
            updatedAt: row.updatedAt.toISOString(),
          }
        : fallback

      return result
    },
    {} as Record<string, AdaptedContent>,
  )

  const records: PublishRecord[] = recordRows.map((record) => ({
    id: record.id,
    platformId: record.platform.name,
    platformName: record.platform.displayName,
    title: record.adaptedContent?.title ?? content.title,
    status: record.status === 'success' ? 'success' : 'failed',
    message: record.message,
    publishedAt: (record.publishedAt ?? record.createdAt).toISOString(),
    simulatedUrl: record.platformUrl ?? undefined,
  }))

  return {
    source,
    platforms,
    selectedPlatformIds: platforms.filter((platform) => platform.enabled).map((platform) => platform.id),
    adapted,
    records,
  }
}

export async function resetWorkspaceData(): Promise<WorkspaceState> {
  const source = {
    ...createSeedSource(),
    id: 'content_demo_001',
  }
  const adapted = adaptForAllPlatforms(source, defaultPlatforms)
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.publishRecord.deleteMany()
    await tx.publishTask.deleteMany()
    await tx.adaptedContent.deleteMany()
    await tx.platformAccount.deleteMany()
    await tx.platform.deleteMany()
    await tx.content.deleteMany()

    await tx.content.create({
      data: {
        id: source.id,
        title: source.title,
        body: source.body,
        contentType: 'markdown',
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      },
    })

    for (const platform of defaultPlatforms) {
      const platformDbId = `platform_${platform.id}`

      await tx.platform.create({
        data: {
          id: platformDbId,
          name: platform.id,
          displayName: platform.displayName,
          shortName: platform.shortName,
          description: platform.description,
          colorClass: platform.colorClass,
          accentClass: platform.accentClass,
          source: 'builtin',
          enabled: true,
          maxTitleLength: platform.maxTitleLength,
          maxContentLength: platform.maxContentLength,
          requiredFields: JSON.stringify(platform.requiredFields),
          styleGuide: platform.styleGuide,
          adapterKey: platform.id,
          config: JSON.stringify(platform.config ?? {}),
          createdAt: now,
          updatedAt: now,
        },
      })

      await tx.platformAccount.create({
        data: {
          id: `account_${platform.id}_mock`,
          platformId: platformDbId,
          accountName: `${platform.displayName}模拟账号`,
          authType: 'mock',
          status: 'connected',
          createdAt: now,
          updatedAt: now,
        },
      })

      const adaptedContent = adapted[platform.id]
      await tx.adaptedContent.create({
        data: {
          id: `adapted_${platform.id}_demo_001`,
          contentId: source.id,
          platformId: platformDbId,
          title: adaptedContent.title,
          body: adaptedContent.body,
          tags: JSON.stringify(adaptedContent.tags),
          warnings: JSON.stringify(adaptedContent.warnings),
          isEdited: false,
          adaptedAt: now,
          updatedAt: now,
        },
      })
    }

    await tx.publishTask.create({
      data: {
        id: 'task_demo_001',
        contentId: source.id,
        mode: 'simulate',
        status: 'success',
        platformCount: defaultPlatforms.length,
        successCount: defaultPlatforms.length,
        failedCount: 0,
        createdAt: now,
        startedAt: now,
        finishedAt: now,
      },
    })

    for (const platform of defaultPlatforms) {
      await tx.publishRecord.create({
        data: {
          id: `record_${platform.id}_demo_001`,
          taskId: 'task_demo_001',
          contentId: source.id,
          platformId: `platform_${platform.id}`,
          adaptedContentId: `adapted_${platform.id}_demo_001`,
          accountId: `account_${platform.id}_mock`,
          status: 'success',
          message: '默认模拟发布记录，未调用真实平台 API。',
          platformPostId: `mock_${platform.id}_001`,
          platformUrl: `https://example.local/${platform.id}/mock_001`,
          requestSnapshot: JSON.stringify({ mode: 'simulate', platformId: platform.id }),
          responseSnapshot: JSON.stringify({ success: true }),
          publishedAt: now,
          createdAt: now,
        },
      })
    }
  })

  return getWorkspaceState()
}
