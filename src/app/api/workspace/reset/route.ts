import { NextResponse } from 'next/server'
import { resetWorkspaceData } from '@/server/workspace/workspace.service'

export async function POST() {
  try {
    const workspace = await resetWorkspaceData()
    return NextResponse.json(workspace)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset workspace' },
      { status: 500 },
    )
  }
}
