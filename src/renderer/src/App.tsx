import { useEffect, useState } from 'react'
import type { AuthState, DeviceCodePrompt } from '../../shared/auth'

function App(): React.JSX.Element {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [prompt, setPrompt] = useState<DeviceCodePrompt | null>(null)

  useEffect(() => {
    void window.api.auth.getState().then(setAuth)
    return window.api.auth.onChanged((state) => {
      setAuth(state)
      setPrompt(null)
    })
  }, [])

  const handleLogin = async (): Promise<void> => {
    setPrompt(await window.api.auth.startLogin())
  }

  return (
    <main className="app">
      <h1>Co-op Cloud Saving</h1>
      <p className="subtitle">
        Sync co-op game saves between friends through a private GitHub repo.
      </p>

      {auth === null && <p className="muted">Checking session…</p>}

      {auth?.status === 'signed-in' && (
        <section className="card">
          <img className="avatar" src={auth.user.avatarUrl} alt="" />
          <p>
            Signed in as <strong>{auth.user.login}</strong>
          </p>
          <button className="secondary" onClick={() => void window.api.auth.logout()}>
            Sign out
          </button>
        </section>
      )}

      {auth?.status === 'signed-out' && !prompt && (
        <button onClick={() => void handleLogin()}>Sign in with GitHub</button>
      )}

      {auth?.status === 'signed-out' && prompt && (
        <section className="card">
          <p>Enter this code on GitHub:</p>
          <p className="code">{prompt.userCode}</p>
          <a href={prompt.verificationUri} target="_blank" rel="noreferrer">
            {prompt.verificationUri}
          </a>
          <p className="muted">Waiting for authorization…</p>
        </section>
      )}
    </main>
  )
}

export default App
