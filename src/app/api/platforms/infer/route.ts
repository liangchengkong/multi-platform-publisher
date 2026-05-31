import { NextRequest, NextResponse } from 'next/server'
import { inferPlatformConfig } from '@/domain/platforms/inference'
import type { PlatformInferenceContext, PlatformInput } from '@/domain/platforms/model'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      platform?: unknown
      description?: unknown
      samples?: unknown
      context?: unknown
    }

    if (!body.platform || typeof body.platform !== 'object') {
      return NextResponse.json({ error: 'platform is required' }, { status: 400 })
    }

    const samples = Array.isArray(body.samples)
      ? body.samples.filter((sample): sample is string => typeof sample === 'string')
      : []

    const result = inferPlatformConfig({
      platform: body.platform as PlatformInput,
      description: typeof body.description === 'string' ? body.description : '',
      samples,
      context: body.context && typeof body.context === 'object' ? body.context as PlatformInferenceContext : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to infer platform config' },
      { status: 400 },
    )
  }
}
