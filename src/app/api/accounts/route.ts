import { NextResponse } from 'next/server'
import { listAccountStatuses } from '@/server/accounts/accounts.service'

export async function GET() {
  try {
    const accounts = await listAccountStatuses()
    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load accounts' },
      { status: 500 },
    )
  }
}
