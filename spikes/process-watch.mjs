// Stage 0 spike: can ps-list reliably tell whether a process is running?
// Usage: node spikes/process-watch.mjs <process-name.exe>
import psList from 'ps-list'

const target = (process.argv[2] ?? '').toLowerCase()
if (!target) {
  console.error('Usage: node spikes/process-watch.mjs <process-name.exe>')
  process.exit(1)
}

const t0 = Date.now()
const procs = await psList()
const ms = Date.now() - t0

const hits = procs.filter((p) => p.name.toLowerCase() === target)
console.log(`scanned ${procs.length} processes in ${ms}ms`)
console.log(hits.length ? `FOUND: ${hits.map((p) => `${p.name} (pid ${p.pid})`).join(', ')}` : 'NOT FOUND')
