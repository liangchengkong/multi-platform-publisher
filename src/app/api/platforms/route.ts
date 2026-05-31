import { NextRequest, NextResponse } from 'next/server'
import { createCustomPlatform, listPlatformDefinitions } from '@/server/platforms/platforms.service'

export async function GET() {
  try {
    const platforms = await listPlatformDefinitions()
    return NextResponse.json(platforms)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json()
    const platform = await createCustomPlatform(input)
    return NextResponse.json(platform, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create platform' },
      { status: 400 },
    )
  }
}
