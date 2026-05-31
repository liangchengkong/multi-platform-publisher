import { NextRequest, NextResponse } from 'next/server'
import { updateAdaptedContent } from '@/server/adapted-content/adapted-content.service'

export async function PATCH(request: NextRequest, context: RouteContext<'/api/adapted-content/[id]'>) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { title?: unknown; body?: unknown }

    if (typeof body.title !== 'string' || typeof body.body !== 'string') {
      return NextResponse.json({ error: 'title and body must be strings' }, { status: 400 })
    }

    const adapted = await updateAdaptedContent(id, { title: body.title, body: body.body })
    return NextResponse.json(adapted)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update adapted content' },
      { status: 500 },
    )
  }
}
