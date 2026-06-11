import { useState } from 'react'

function App(): React.JSX.Element {
  const [reply, setReply] = useState<string | null>(null)

  const handlePing = async (): Promise<void> => {
    setReply(await window.api.ping())
  }

  return (
    <main className="app">
      <h1>Co-op Cloud Saving</h1>
      <p className="subtitle">
        Sync co-op game saves between friends through a private GitHub repo.
      </p>
      <p className="status">Stage 1 — app skeleton</p>
      <button onClick={handlePing}>Test IPC bridge</button>
      {reply && <p className="reply">Main process replied: “{reply}”</p>}
    </main>
  )
}

export default App
