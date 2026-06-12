import type { AuthState, DeviceCodePrompt } from '../shared/auth'

declare global {
  interface Window {
    api: {
      auth: {
        getState: () => Promise<AuthState>
        startLogin: () => Promise<DeviceCodePrompt>
        logout: () => Promise<void>
        onChanged: (callback: (state: AuthState) => void) => () => void
      }
    }
  }
}

export {}
