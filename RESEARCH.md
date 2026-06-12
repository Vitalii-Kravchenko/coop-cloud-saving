# Stage 0 — Research notes

Facts gathered before building the product. Updated as experiments complete.

## Save locations (Windows)

### Satisfactory — CONFIRMED on a real machine (2026-06-11)

- Path: `%LocalAppData%\FactoryGame\Saved\SaveGames\<SteamID64>\`
- Saves live inside an **account-specific folder** (SteamID64) — the adapter must map it
- A "world" is a set of files sharing a name prefix:
  - `Dream_autosave_0..2.sav` — rotating autosaves
  - `Dream_DDMMYY-HHmmss.sav` — manual saves with a timestamp in the name
- Early-game save ≈ 0.18 MB; grows into tens of MB late game (LFS becomes relevant then, not at start)
- `steam_autocloud.vdf` present → **Steam Cloud is enabled by default** for this game; it must be
  disabled before the app manages saves (risk #3 in the plan)
- `ServerManager_V2.sav` sits at the SaveGames root — dedicated-server bookkeeping, not a world

### Terraria — not verified yet (game not installed on the test machine)

- Expected: `Documents\My Games\Terraria\{Worlds,Players}`

### Stardew Valley — not verified yet (game not installed on the test machine)

- Expected: `%AppData%\StardewValley\Saves`

## Process detection — ps-list spike (2026-06-11)

- Script: [`spikes/process-watch.mjs`](spikes/process-watch.mjs)
- Scanning ~225 processes takes **~25 ms** → polling every few seconds is essentially free
- Start/stop detection verified with `Notepad.exe`; match names case-insensitively
- **Verdict: GO.**

## GitHub OAuth Device Flow — VERIFIED end to end (2026-06-11)

- OAuth App registered (Client ID `Ov23liThtglJqUxY4Kh0` — public by design, no client secret needed)
- "Enable Device Flow" checkbox in the app settings is mandatory
- Script: [`spikes/device-flow.mjs`](spikes/device-flow.mjs) — request code → user enters it at
  github.com/login/device → poll → token with `read:user,repo` scopes received, identity confirmed
- Polling: 5s interval, handle `authorization_pending` / `slow_down` (+5s) / `expired_token`
- **Verdict: GO.** This is exactly what AuthService will do in stage 2 (plus safeStorage for the token)

## Git LFS quotas — verified against GitHub Docs (2026-06)

- Free tier: **1 GB storage + 1 GB bandwidth per month**; bandwidth counts *downloads*
- Exceeding the quota with a $0 budget **blocks LFS until the next month**
- Two players pulling a 30 MB save daily ≈ 1.8 GB/month → over the limit
- **Decision: LFS per game** (Satisfactory late-game only); small-save games use plain git

## Git LFS spike — VERIFIED on a real connection (2026-06-12)

- Setup: temporary private repo `lfs-spike-tmp`, 30 MB of random (incompressible) bytes
  tracked via `.gitattributes` (`*.bin filter=lfs`)
- **Push (upload): 12.2 s** (~2.5 MB/s) — post-exit sync after a session
- **Fresh clone (download): 9.9 s** (~4.5 MiB/s) — pre-launch sync on the other machine
- File arrived intact (30 MB), LFS smudge filter worked transparently
- **Verdict: GO.** ~10 s of sync before launching a game is acceptable UX even for
  late-game Satisfactory saves; show a progress indicator anyway

## TODO

- [ ] Manual Satisfactory save transfer between two accounts/PCs (does the world open? can you host?)
- [x] GitHub OAuth App registered + Device Flow tested end to end (2026-06-11)
- [x] LFS spike: push/pull a 30 MB file, measure timing (2026-06-12 — see above)
- [ ] Terraria and Stardew Valley checks once the games are installed
- [ ] Stardew: what happens to farmhands when the host changes (riskiest game)
