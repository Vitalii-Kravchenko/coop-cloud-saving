import { app, safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

// The token is encrypted with the OS user account (DPAPI on Windows),
// so the file is useless on another machine or under another Windows user.

const tokenFile = (): string => join(app.getPath('userData'), 'auth.json')

export function saveToken(token: string): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OS-level encryption is not available')
  }
  const file = tokenFile()
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify({ token: safeStorage.encryptString(token).toString('base64') }))
}

export function loadToken(): string | null {
  const file = tokenFile()
  if (!existsSync(file)) return null
  try {
    const { token } = JSON.parse(readFileSync(file, 'utf8')) as { token: string }
    return safeStorage.decryptString(Buffer.from(token, 'base64'))
  } catch {
    return null
  }
}

export function clearToken(): void {
  rmSync(tokenFile(), { force: true })
}
