# Co-op Cloud Saving

Sync co-op game saves between friends through a private GitHub repo. Play the same world from
different PCs: whoever hits Play gets the latest save, and a lock prevents two people from
running the world at the same time.

> **Status:** early development — stage 1 (app skeleton). Windows-first.

## Tech

Electron + TypeScript + React, bundled with [electron-vite](https://electron-vite.org/).

## Project layout

```
src/
  main/            Electron main process (Node.js side)
    core/          services: auth, repo (git), sync, lock, process watcher, config
    adapters/      one adapter per supported game (Satisfactory, Terraria, ...)
  preload/         contextBridge API exposed to the UI
  renderer/        React UI
```

## Development

```
npm install
npm run dev        # run the app with hot reload
npm run typecheck  # TypeScript check (main + renderer)
npm run lint       # ESLint
npm run build      # production build
```
