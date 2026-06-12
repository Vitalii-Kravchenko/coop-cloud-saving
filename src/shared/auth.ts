// Types shared by main, preload and renderer.

export interface AuthUser {
  login: string
  avatarUrl: string
}

export type AuthState = { status: 'signed-out' } | { status: 'signed-in'; user: AuthUser }

export interface DeviceCodePrompt {
  userCode: string
  verificationUri: string
  expiresIn: number
}
