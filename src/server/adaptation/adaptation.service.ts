import { adaptForAllPlatforms } from '@/domain/publisher/adapters'
import type { SourceContent } from '@/domain/publisher/model'
import { prisma } from '@/lib/db'
import { listPlatformDefinitions } from '@/server/platforms/platforms.service'

export async function regenerateAdaptedContents(source: SourceContent) {
  const platforms = await listPlatformDefinitions()
  const adapted = adaptForAllPlatforms(source, platforms)

  await Promise.all(
    platforms.map(async (platform) => {
      const row = await prisma.platform.findUnique({ where: { name: platform.id } })
      const item = adapted[platform.id]
      if (!row || !item) return

      await prisma.adaptedContent.upsert({
        where: {
          contentId_platformId: {
            contentId: source.id,
            platformId: row.id,
          },
        },
        create: {
          contentId: source.id,
          platformId: row.id,
          title: item.title,
          body: item.body,
          tags: JSON.stringify(item.tags),
          warnings: JSON.stringify(item.warnings),
          isEdited: false,
        },
        update: {
          title: item.title,
          body: item.body,
          tags: JSON.stringify(item.tags),
          warnings: JSON.stringify(item.warnings),
          isEdited: false,
        },
      })
    }),
  )

  return adapted
}
