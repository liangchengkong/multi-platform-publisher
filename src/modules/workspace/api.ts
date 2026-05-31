import type { AdaptedContent, PlatformId, PublishRecord, SourceContent, WorkspaceState } from '@/domain/publisher/model'

export async function getWorkspaceFromApi(): Promise<WorkspaceState> {
  const response = await fetch('/api/workspace', {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load workspace: ${response.status}`)
  }

  return response.json() as Promise<WorkspaceState>
}

export async function resetWorkspaceInApi(): Promise<WorkspaceState> {
  const response = await fetch('/api/workspace/reset', {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to reset workspace: ${response.status}`)
  }

  return response.json() as Promise<WorkspaceState>
}

export async function updateContentInApi(contentId: string, input: Pick<SourceContent, 'title' | 'body'>): Promise<SourceContent> {
  const response = await fetch(`/api/content/${contentId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to update content: ${response.status}`)
  }

  return response.json() as Promise<SourceContent>
}

export async function updateAdaptedContentInApi(
  adaptedContentId: string,
  input: Pick<AdaptedContent, 'title' | 'body'>,
): Promise<AdaptedContent> {
  const response = await fetch(`/api/adapted-content/${adaptedContentId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to update adapted content: ${response.status}`)
  }

  return response.json() as Promise<AdaptedContent>
}

export async function publishSelectedInApi(contentId: string, platformIds: PlatformId[]): Promise<PublishRecord[]> {
  const response = await fetch('/api/publish', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentId, platformIds }),
  })

  if (!response.ok) {
    throw new Error(`Failed to publish: ${response.status}`)
  }

  const data = (await response.json()) as { records: PublishRecord[] }
  return data.records
}

export async function clearPublishRecordsInApi(contentId: string): Promise<void> {
  const response = await fetch(`/api/publish/records?contentId=${encodeURIComponent(contentId)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to clear publish records: ${response.status}`)
  }
}
