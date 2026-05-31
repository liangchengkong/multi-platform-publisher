import type { AdaptedContent, PlatformId } from '@/domain/publisher/model'
import { prisma } from '@/lib/db'

function parseStringArray(value: string | null | undefined) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function toPlatformId(value: string): PlatformId {
  return value as PlatformId
}

export async function updateAdaptedContent(
  adaptedContentId: string,
  input: Pick<AdaptedContent, 'title' | 'body'>,
): Promise<AdaptedContent> {
  const adapted = await prisma.adaptedContent.update({
    where: { id: adaptedContentId },
    data: {
      title: input.title,
      body: input.body,
      isEdited: true,
    },
    include: {
      platform: true,
    },
  })

  return {
    id: adapted.id,
    platformId: toPlatformId(adapted.platform.name),
    title: adapted.title,
    body: adapted.body,
    tags: parseStringArray(adapted.tags),
    warnings: parseStringArray(adapted.warnings),
    updatedAt: adapted.updatedAt.toISOString(),
  }
}
