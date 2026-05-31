import { NextResponse } from 'next/server'
import { createAccountAuthUrl, isPlatformId } from '@/server/accounts/accounts.service'

export async function POST(_request: Request, context: RouteContext<'/api/accounts/[platform]/auth-url'>) {
  try {
    const { platform } = await context.params

    if (!isPlatformId(platform)) {
      return NextResponse.json({ error: 'Unknown platform' }, { status: 404 })
    }

    const result = await createAccountAuthUrl(platform)
    return NextResponse.json(result, { status: result.supported ? 200 : 501 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create auth url' },
      { status: 500 },
    )
  }
}
