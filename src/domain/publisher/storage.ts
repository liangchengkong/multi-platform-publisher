import { adaptForAllPlatforms } from './adapters'
import type { AdaptedContent, PlatformId, SourceContent, WorkspaceState } from './model'
import { defaultPlatforms, platformOrder } from './platforms'

const STORAGE_KEY = 'multi-platform-publisher.workspace.v1'

export function createSeedSource(): SourceContent {
  return {
    id: 'draft-main',
    title: '如何把一篇内容高效发布到多个平台',
    body: `# 背景
很多创作者会同时维护公众号、知乎、B站和小红书。真正耗时的不是复制粘贴，而是每个平台的格式、语气和长度限制都不一样。

## 我的目标
用一个工具完成原文编辑、平台适配、发布前预览和发布记录追踪。

## 实践建议
**先写一份完整原文**，再按平台生成不同版本。公众号保留完整结构，知乎强调观点和论据，B站适合轻松分段，小红书需要短文案和标签。

## 结论
多平台发布工具最重要的不是替代创作者，而是减少重复劳动，让创作者把精力放在内容判断上。`,
    updatedAt: new Date().toISOString(),
  }
}

export function createSeedWorkspace(): WorkspaceState {
  const source = createSeedSource()
  return {
    source,
    platforms: defaultPlatforms,
    selectedPlatformIds: platformOrder,
    adapted: adaptForAllPlatforms(source),
    records: [],
  }
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function normalizeWorkspace(state: WorkspaceState): WorkspaceState {
  const platforms = defaultPlatforms.map((fallback) => {
    const saved = state.platforms?.find((platform) => platform.id === fallback.id)
    return saved ? { ...fallback, enabled: saved.enabled } : fallback
  })
  const source = state.source ?? createSeedSource()
  const adapted = adaptForAllPlatforms(source)
  const mergedAdapted = platformOrder.reduce(
    (result, platformId) => ({
      ...result,
      [platformId]: state.adapted?.[platformId] ?? adapted[platformId],
    }),
    {} as Record<PlatformId, AdaptedContent>,
  )
  const enabledIds = platforms.filter((platform) => platform.enabled).map((platform) => platform.id)

  return {
    source,
    platforms,
    selectedPlatformIds: (state.selectedPlatformIds ?? platformOrder).filter((id) => enabledIds.includes(id)),
    adapted: mergedAdapted,
    records: state.records ?? [],
  }
}

export function loadWorkspace() {
  if (!isBrowser()) return createSeedWorkspace()

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedWorkspace()
    saveWorkspace(seed)
    return seed
  }

  try {
    return normalizeWorkspace(JSON.parse(raw) as WorkspaceState)
  } catch {
    const seed = createSeedWorkspace()
    saveWorkspace(seed)
    return seed
  }
}

export function saveWorkspace(state: WorkspaceState) {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetWorkspace() {
  const seed = createSeedWorkspace()
  saveWorkspace(seed)
  return seed
}
