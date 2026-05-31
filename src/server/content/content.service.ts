import type { SourceContent } from '@/domain/publisher/model'
import { prisma } from '@/lib/db'
import { regenerateAdaptedContents } from '@/server/adaptation/adaptation.service'

export async function updateContent(contentId: string, input: Pick<SourceContent, 'title' | 'body'>): Promise<SourceContent> {
  const content = await prisma.content.update({
    where: { id: contentId },
    data: {
      title: input.title,
      body: input.body,
    },
  })

  await regenerateAdaptedContents({
    id: content.id,
    title: content.title,
    body: content.body,
    updatedAt: content.updatedAt.toISOString(),
  })

  return {
    id: content.id,
    title: content.title,
    body: content.body,
    updatedAt: content.updatedAt.toISOString(),
  }
}
