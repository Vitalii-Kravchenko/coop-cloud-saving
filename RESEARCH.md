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

## Git LFS quotas — verified against GitHub Docs (2026-06)

- Free tier: **1 GB storage + 1 GB bandwidth per month**; bandwidth counts *downloads*
- Exceeding the quota with a $0 budget **blocks LFS until the next month**
- Two players pulling a 30 MB save daily ≈ 1.8 GB/month → over the limit
- **Decision: LFS per game** (Satisfactory late-game only); small-save games use plain git

## TODO

- [ ] Manual Satisfactory save transfer between two accounts/PCs (does the world open? can you host?)
- [ ] GitHub OAuth App registered + Device Flow tested end to end
- [ ] LFS spike: push/pull a 30 MB file, measure timing
- [ ] Terraria and Stardew Valley checks once the games are installed
- [ ] Stardew: what happens to farmhands when the host changes (riskiest game)
