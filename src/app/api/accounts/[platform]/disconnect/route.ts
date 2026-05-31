import { NextResponse } from 'next/server'
import { disconnectAccount, isPlatformId } from '@/server/accounts/accounts.service'

export async function POST(_request: Request, context: RouteContext<'/api/accounts/[platform]/disconnect'>) {
  try {
    const { platform } = await context.params

    if (!isPlatformId(platform)) {
      return NextResponse.json({ error: 'Unknown platform' }, { status: 404 })
    }

    const status = await disconnectAccount(platform)
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect account' },
      { status: 500 },
    )
  }
}
