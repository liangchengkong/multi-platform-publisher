import { NextResponse } from 'next/server'
import { getWorkspaceState } from '@/server/workspace/workspace.service'

export async function GET() {
  try {
    const workspace = await getWorkspaceState()
    return NextResponse.json(workspace)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load workspace' },
      { status: 500 },
    )
  }
}
