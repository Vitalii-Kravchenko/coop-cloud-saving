// The extensibility heart of the app: every supported game is one adapter
// implementing this interface. The core services never know game specifics.

export interface SavePathInfo {
  found: boolean
  basePath?: string
  details?: string
}

export interface WorldInfo {
  id: string
  name: string
  path: string
  lastModified: Date
  sizeBytes: number
}

export interface FileSet {
  files: string[]
}

export interface WorldMeta {
  gameVersion?: string
  lastPlayedBy?: string
  lastPlayedAt?: string
}

export interface CompatibilityWarning {
  severity: 'info' | 'warning' | 'blocker'
  message: string
}

export interface SteamCloudConfig {
  appId: number
  warning: string
}

export interface GameAdapter {
  id: string // "satisfactory"
  displayName: string
  processNames: string[] // ["FactoryGame-Win64-Shipping.exe"]
  /** Saves are large here (tens of MB) — store them via Git LFS. Small-save games skip LFS. */
  useLfs: boolean
  detectSavePaths(): Promise<SavePathInfo>
  listWorlds(savePath: string): Promise<WorldInfo[]>
  /** Files shared by everyone (the world itself). */
  getWorldFiles(world: WorldInfo): FileSet
  /** Files belonging to one player (e.g. Terraria .plr) — synced per user. */
  getPlayerFiles?(world: WorldInfo): FileSet
  validateCompatibility?(local: WorldMeta, remote: WorldMeta): CompatibilityWarning[]
  steamCloudConfig: SteamCloudConfig
}
