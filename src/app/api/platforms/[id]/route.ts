import { NextRequest, NextResponse } from 'next/server'
import { deleteCustomPlatform, updatePlatform } from '@/server/platforms/platforms.service'

export async function PATCH(request: NextRequest, context: RouteContext<'/api/platforms/[id]'>) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const platform = await updatePlatform(id, body)
    return NextResponse.json(platform)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update platform' },
      { status: 400 },
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext<'/api/platforms/[id]'>) {
  try {
    const { id } = await context.params
    const result = await deleteCustomPlatform(id)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete platform' },
      { status: 400 },
    )
  }
}
