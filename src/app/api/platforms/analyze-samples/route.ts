import { NextRequest, NextResponse } from 'next/server'
import { analyzePlatformSamples } from '@/domain/platforms/sample-analysis'
import type { PlatformInput } from '@/domain/platforms/model'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { platform?: unknown; samples?: unknown }

    if (!body.platform || typeof body.platform !== 'object') {
      return NextResponse.json({ error: 'platform is required' }, { status: 400 })
    }

    if (!Array.isArray(body.samples)) {
      return NextResponse.json({ error: 'samples must be an array' }, { status: 400 })
    }

    const samples = body.samples.filter((sample): sample is string => typeof sample === 'string')
    const result = analyzePlatformSamples(body.platform as PlatformInput, samples)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze platform samples' },
      { status: 400 },
    )
  }
}
