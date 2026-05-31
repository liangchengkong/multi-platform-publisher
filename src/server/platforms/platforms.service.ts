import type { ConfigurableAdapterConfig, PlatformDefinition } from '@/domain/publisher/model'
import { adaptForPlatform } from '@/domain/publisher/adapters'
import type { PlatformInput } from '@/domain/platforms/model'
import { defaultPlatforms } from '@/domain/platforms/builtin'
import { prisma } from '@/lib/db'

function parseStringArray(value: string | null | undefined) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function parseConfig(value: string | null | undefined): ConfigurableAdapterConfig {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as ConfigurableAdapterConfig
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function normalizePlatformName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function fallbackFor(name: string) {
  return defaultPlatforms.find((platform) => platform.id === name)
}

export function toPlatformDefinition(row: {
  name: string
  displayName: string
  shortName: string
  description: string
  colorClass: string
  accentClass: string
  source: string
  enabled: boolean
  maxTitleLength: number
  maxContentLength: number
  requiredFields: string
  styleGuide: string
  config: string
}): PlatformDefinition {
  const fallback = fallbackFor(row.name)

  return {
    id: row.name,
    displayName: row.displayName || fallback?.displayName || row.name,
    shortName: row.shortName || fallback?.shortName || row.displayName || row.name,
    description: row.description || fallback?.description || '',
    colorClass: row.colorClass || fallback?.colorClass || 'bg-slate-600',
    accentClass: row.accentClass || fallback?.accentClass || 'border-slate-500 bg-slate-50 text-slate-800',
    source: row.source === 'custom' ? 'custom' : 'builtin',
    enabled: row.enabled,
    maxTitleLength: row.maxTitleLength,
    maxContentLength: row.maxContentLength,
    requiredFields: parseStringArray(row.requiredFields),
    styleGuide: row.styleGuide || fallback?.styleGuide || '',
    config: parseConfig(row.config),
  }
}

async function regeneratePlatformAdaptedContents(platform: PlatformDefinition, platformDbId: string) {
  const contents = await prisma.content.findMany()

  await Promise.all(
    contents.map(async (content) => {
      const source = {
        id: content.id,
        title: content.title,
        body: content.body,
        updatedAt: content.updatedAt.toISOString(),
      }
      const adapted = adaptForPlatform(source, platform)

      await prisma.adaptedContent.upsert({
        where: {
          contentId_platformId: {
            contentId: content.id,
            platformId: platformDbId,
          },
        },
        create: {
          contentId: content.id,
          platformId: platformDbId,
          title: adapted.title,
          body: adapted.body,
          tags: JSON.stringify(adapted.tags),
          warnings: JSON.stringify(adapted.warnings),
          isEdited: false,
        },
        update: {
          title: adapted.title,
          body: adapted.body,
          tags: JSON.stringify(adapted.tags),
          warnings: JSON.stringify(adapted.warnings),
          isEdited: false,
        },
      })
    }),
  )
}

export async function listPlatformDefinitions(): Promise<PlatformDefinition[]> {
  const platformRows = await prisma.platform.findMany({
    orderBy: { createdAt: 'asc' },
  })

  return platformRows.map(toPlatformDefinition)
}

export async function updatePlatformEnabled(platformId: string, enabled: boolean): Promise<PlatformDefinition> {
  const platform = await prisma.platform.update({
    where: { name: platformId },
    data: { enabled },
  })

  const definition = toPlatformDefinition(platform)
  await regeneratePlatformAdaptedContents(definition, platform.id)
  return definition
}

export async function createCustomPlatform(input: PlatformInput): Promise<PlatformDefinition> {
  const name = normalizePlatformName(input.name)

  if (!name) {
    throw new Error('Platform name is required')
  }

  if (fallbackFor(name)) {
    throw new Error('Built-in platform cannot be recreated')
  }

  const platform = await prisma.platform.create({
    data: {
      name,
      displayName: input.displayName.trim(),
      shortName: input.shortName.trim() || input.displayName.trim(),
      description: input.description.trim(),
      colorClass: input.colorClass,
      accentClass: input.accentClass,
      source: 'custom',
      enabled: true,
      maxTitleLength: input.maxTitleLength,
      maxContentLength: input.maxContentLength,
      requiredFields: JSON.stringify(input.requiredFields),
      styleGuide: input.styleGuide,
      adapterKey: 'configurable',
      config: JSON.stringify(input.config),
    },
  })

  await prisma.platformAccount.create({
    data: {
      id: `account_${name}_mock`,
      platformId: platform.id,
      accountName: `${platform.displayName}模拟账号`,
      authType: 'mock',
      status: 'connected',
      configEncrypted: JSON.stringify({ mode: 'simulate' }),
    },
  })

  const definition = toPlatformDefinition(platform)
  if (definition.source === 'custom') {
    await regeneratePlatformAdaptedContents(definition, platform.id)
  }
  return definition
}

export async function updatePlatform(platformId: string, input: Partial<PlatformInput> & { enabled?: boolean }) {
  const current = await prisma.platform.findUnique({ where: { name: platformId } })
  if (!current) throw new Error('Platform not found')

  const isBuiltin = current.source !== 'custom'
  const data = {
    displayName: input.displayName?.trim(),
    shortName: input.shortName?.trim(),
    description: input.description?.trim(),
    colorClass: input.colorClass,
    accentClass: input.accentClass,
    enabled: input.enabled,
    maxTitleLength: input.maxTitleLength,
    maxContentLength: input.maxContentLength,
    requiredFields: input.requiredFields ? JSON.stringify(input.requiredFields) : undefined,
    styleGuide: input.styleGuide,
    config: input.config ? JSON.stringify(input.config) : undefined,
  }

  const platform = await prisma.platform.update({
    where: { name: platformId },
    data: isBuiltin ? { enabled: data.enabled } : data,
  })

  return toPlatformDefinition(platform)
}

export async function deleteCustomPlatform(platformId: string) {
  const platform = await prisma.platform.findUnique({ where: { name: platformId } })
  if (!platform) throw new Error('Platform not found')
  if (platform.source !== 'custom') throw new Error('Built-in platform cannot be deleted')

  await prisma.platform.delete({ where: { name: platformId } })
  return { deleted: true }
}
