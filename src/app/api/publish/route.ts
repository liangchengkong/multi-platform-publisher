import { NextRequest, NextResponse } from 'next/server'
import { simulatePublishToPlatforms } from '@/server/publishing/publish.service'

function isPlatformId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9-]+$/.test(value)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { contentId?: unknown; platformIds?: unknown }

    if (typeof body.contentId !== 'string' || !Array.isArray(body.platformIds)) {
      return NextResponse.json({ error: 'contentId and platformIds are required' }, { status: 400 })
    }

    const platformIds = body.platformIds.filter(isPlatformId)

    if (platformIds.length === 0) {
      return NextResponse.json({ error: 'No valid platforms selected' }, { status: 400 })
    }

    const records = await simulatePublishToPlatforms({
      contentId: body.contentId,
      platformIds,
    })

    return NextResponse.json({ success: true, records })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish' },
      { status: 500 },
    )
  }
}
