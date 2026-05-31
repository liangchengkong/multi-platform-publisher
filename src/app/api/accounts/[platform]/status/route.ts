import { NextResponse } from 'next/server'
import { getAccountStatus, isPlatformId } from '@/server/accounts/accounts.service'

export async function GET(_request: Request, context: RouteContext<'/api/accounts/[platform]/status'>) {
  try {
    const { platform } = await context.params

    if (!isPlatformId(platform)) {
      return NextResponse.json({ error: 'Unknown platform' }, { status: 404 })
    }

    const status = await getAccountStatus(platform)
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load account status' },
      { status: 500 },
    )
  }
}
