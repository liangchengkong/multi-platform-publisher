import type { PlatformDefinition } from '@/domain/publisher/model'
import type { PlatformDetectionResult, PlatformInput, PlatformSampleAnalysisResult } from '@/domain/platforms/model'

export async function getPlatformsFromApi(): Promise<PlatformDefinition[]> {
  const response = await fetch('/api/platforms', {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load platforms: ${response.status}`)
  }

  return response.json() as Promise<PlatformDefinition[]>
}

export async function createPlatformInApi(input: PlatformInput): Promise<PlatformDefinition> {
  const response = await fetch('/api/platforms', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to create platform: ${response.status}`)
  }

  return response.json() as Promise<PlatformDefinition>
}

export async function updatePlatformInApi(platformId: string, input: Partial<PlatformInput> & { enabled?: boolean }): Promise<PlatformDefinition> {
  const response = await fetch(`/api/platforms/${platformId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to update platform: ${response.status}`)
  }

  return response.json() as Promise<PlatformDefinition>
}

export async function deletePlatformInApi(platformId: string): Promise<void> {
  const response = await fetch(`/api/platforms/${platformId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete platform: ${response.status}`)
  }
}

export async function detectPlatformInApi(url: string): Promise<PlatformDetectionResult> {
  const response = await fetch('/api/platforms/detect', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    throw new Error(`Failed to detect platform: ${response.status}`)
  }

  return response.json() as Promise<PlatformDetectionResult>
}

export async function analyzePlatformSamplesInApi(platform: PlatformInput, samples: string[]): Promise<PlatformSampleAnalysisResult> {
  const response = await fetch('/api/platforms/analyze-samples', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ platform, samples }),
  })

  if (!response.ok) {
    throw new Error(`Failed to analyze platform samples: ${response.status}`)
  }

  return response.json() as Promise<PlatformSampleAnalysisResult>
}
