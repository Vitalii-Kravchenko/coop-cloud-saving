// GitHub OAuth Device Flow — verified live in spikes/device-flow.mjs.
// The client id is public by design: Device Flow needs no client secret.
export const GITHUB_CLIENT_ID = 'Ov23liThtglJqUxY4Kh0'
const SCOPE = 'repo read:user'

export interface DeviceCode {
  deviceCode: string
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
}

async function post<T>(url: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  if (!res.ok) throw new Error(`${url} responded ${res.status}`)
  return (await res.json()) as T
}

export async function requestDeviceCode(): Promise<DeviceCode> {
  const data = await post<{
    device_code?: string
    user_code?: string
    verification_uri?: string
    expires_in?: number
    interval?: number
    error?: string
  }>('https://github.com/login/device/code', { client_id: GITHUB_CLIENT_ID, scope: SCOPE })
  if (!data.device_code || !data.user_code || !data.verification_uri) {
    throw new Error(`Device flow start failed: ${data.error ?? 'unexpected response'}`)
  }
  return {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    expiresIn: data.expires_in ?? 900,
    interval: data.interval ?? 5
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export async function waitForAccessToken(code: DeviceCode): Promise<string> {
  let interval = code.interval
  const deadline = Date.now() + code.expiresIn * 1000

  while (Date.now() < deadline) {
    await sleep(interval * 1000)
    const data = await post<{ access_token?: string; error?: string; error_description?: string }>(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        device_code: code.deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      }
    )
    if (data.access_token) return data.access_token
    if (data.error === 'authorization_pending') continue
    if (data.error === 'slow_down') {
      interval += 5
      continue
    }
    throw new Error(data.error_description ?? data.error ?? 'Device flow failed')
  }
  throw new Error('Timed out waiting for authorization')
}
