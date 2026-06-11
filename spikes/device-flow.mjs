// Stage 0 spike: GitHub OAuth Device Flow end to end.
// Usage: node spikes/device-flow.mjs
// Prints a user code, waits for the user to enter it at github.com/login/device,
// then confirms the received token by asking the API who we are.
const CLIENT_ID = 'Ov23liThtglJqUxY4Kh0'
const SCOPE = 'repo read:user'

const post = async (url, params) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  return res.json()
}

const start = await post('https://github.com/login/device/code', {
  client_id: CLIENT_ID,
  scope: SCOPE
})
if (!start.device_code) {
  console.error('Failed to start device flow:', JSON.stringify(start))
  process.exit(1)
}

console.log(`USER CODE: ${start.user_code}`)
console.log(`Enter it at: ${start.verification_uri}`)
console.log(`Code expires in ${start.expires_in}s, polling every ${start.interval}s...`)

let interval = start.interval
const deadline = Date.now() + start.expires_in * 1000

while (Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, interval * 1000))
  const poll = await post('https://github.com/login/oauth/access_token', {
    client_id: CLIENT_ID,
    device_code: start.device_code,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
  })
  if (poll.access_token) {
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${poll.access_token}`, 'User-Agent': 'coop-cloud-saving-spike' }
    })
    const user = await userRes.json()
    console.log(`SUCCESS: token received (${poll.access_token.slice(0, 7)}…, scope: "${poll.scope}")`)
    console.log(`Authenticated as: ${user.login}`)
    process.exit(0)
  }
  if (poll.error === 'authorization_pending') continue
  if (poll.error === 'slow_down') {
    interval += 5
    continue
  }
  console.error('Device flow failed:', poll.error_description ?? poll.error)
  process.exit(1)
}
console.error('Timed out waiting for authorization.')
process.exit(1)
