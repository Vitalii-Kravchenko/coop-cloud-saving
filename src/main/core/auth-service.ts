import type { AuthState, AuthUser, DeviceCodePrompt } from '../../shared/auth'
import { requestDeviceCode, waitForAccessToken, type DeviceCode } from './device-flow'
import { clearToken, loadToken, saveToken } from './token-store'

async function fetchUser(token: string): Promise<AuthUser | null> {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'coop-cloud-saving' }
  })
  if (!res.ok) return null
  const data = (await res.json()) as { login: string; avatar_url: string }
  return { login: data.login, avatarUrl: data.avatar_url }
}

export class AuthService {
  constructor(private readonly onChange: (state: AuthState) => void) {}

  async getState(): Promise<AuthState> {
    const token = loadToken()
    if (!token) return { status: 'signed-out' }
    const user = await fetchUser(token)
    if (!user) {
      clearToken() // token revoked or expired — drop it so the user can sign in again
      return { status: 'signed-out' }
    }
    return { status: 'signed-in', user }
  }

  /** Returns the code the user must enter on GitHub; finishes the login in the background. */
  async startLogin(): Promise<DeviceCodePrompt> {
    const code = await requestDeviceCode()
    void this.completeLogin(code)
    return {
      userCode: code.userCode,
      verificationUri: code.verificationUri,
      expiresIn: code.expiresIn
    }
  }

  private async completeLogin(code: DeviceCode): Promise<void> {
    try {
      saveToken(await waitForAccessToken(code))
      this.onChange(await this.getState())
    } catch {
      this.onChange({ status: 'signed-out' })
    }
  }

  logout(): void {
    clearToken()
    this.onChange({ status: 'signed-out' })
  }

  /** For the upcoming RepoService (stage 2): git over HTTPS needs this token. */
  getToken(): string | null {
    return loadToken()
  }
}
