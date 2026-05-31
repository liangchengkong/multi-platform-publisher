import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { clearPublishRecordsForContent } from '@/server/publishing/publish.service'

export async function GET() {
  try {
    const records = await prisma.publishRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 })
    }

    await clearPublishRecordsForContent(contentId)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
