import { NextRequest, NextResponse } from 'next/server'
import { detectPlatformFromUrl } from '@/domain/platforms/templates'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: unknown }

    if (typeof body.url !== 'string' || !body.url.trim()) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const result = detectPlatformFromUrl(body.url)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to detect platform' },
      { status: 400 },
    )
  }
}
