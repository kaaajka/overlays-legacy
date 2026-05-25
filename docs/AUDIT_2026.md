# Frontend Audit 2026 - overlays-legacy

## Current verdict

This is a legacy OBS overlay frontend that has been stabilized for 2026 deployment while keeping compatibility with the old backend. The backend protocol is intentionally preserved.

Current score as a deployable legacy OBS widget: **8/10**.
Current score as a professional 2026 OBS widget system: **6.5/10**.

The project is no longer a broken CRA artifact. It is now a Vite-based static frontend with hardened deployment, cleaner build logs, guarded debug logs and documented legacy protocol. It still needs more testing and socket abstraction before it becomes a true 11/10 OBS widget system.

## What is already fixed

### Build and deployment

- CRA / `react-scripts` replaced by Vite.
- Static output uses `dist`.
- Vercel and Netlify configs exist.
- Project uses `pnpm@10.17.1` because npm failed on Vercel with `Exit handler never called`.
- `pnpm.onlyBuiltDependencies` allows `esbuild` and `@parcel/watcher` build scripts.
- Node is pinned to `22.x` in this package for stable Vercel deployment unless a separate Node 24 verification branch is merged.

### Runtime stability

- MobX observable fields are initialized explicitly.
- Queue WebSocket updates are wrapped in `runInAction`.
- `NodeJS.Timeout` was removed from browser component code in favor of `ReturnType<typeof setTimeout>`.
- Runtime debug logs are gated behind `debugLog` and `VITE_DEBUG_LOGS`.
- Sass build warnings were cleaned up with module-based Sass APIs.
- The previous random Sass halo generation risk was bounded to avoid CI build hangs.

### Dependency cleanup

Removed as unused/deprecated in this legacy frontend:

- `gsap` - only used by removed `Donate11` template.
- `html-react-parser` - only existed as a stale commented import.
- `react-audio-player` - unused; audio is handled through `new Audio(...)`.

### Protocol documentation and hardening

- `OVERLAY_PROTOCOL.md` documents routes, WebSocket URLs, payloads and quirks.
- `OBS_QA_CHECKLIST.md` defines manual OBS verification.
- `VERIFY_OVERLAY_EVENTS.md` defines manual event verification.
- `src/dev/fixtures/` contains legacy backend payload examples.
- `safeJsonParse` prevents invalid JSON from crashing overlays.
- Minimal type guards ignore unknown queue/goal/main payloads safely.

## Current explicit routes

The current frontend route contract is explicit-route only:

- `/` - Home/link generator
- `/ALERTS/:uuid` - all alert types
- `/TIP_ALERT/:uuid` - donations/tips only
- `/REWARD_ALERT/:uuid` - Twitch rewards only
- `/SUB_GOAL/:uuid` - subscription goal
- `/FOLLOW_GOAL/:uuid` - follower goal
- `/QUEUE/:uuid` - queue overlay

Runtime test mode uses `?test=true` on the same explicit routes.

### Historical removed routes from old `build.zip` frontend

The old frontend used these routes, but they are no longer active and should render `Overlay not found` now:

- `/channel/:uuid`
- `/channel/:uuid/subs`
- `/channel/:uuid/followers`
- `/channel/:uuid/queue`
- `/test/channel/:uuid`

## Legacy WebSocket mapping

- Main: `VITE_WS_URL?account=:uuid`
- Subs: `VITE_WS_URL/subs?account=:uuid`
- Followers: `VITE_WS_URL/followers?account=:uuid`
- Queue: `VITE_WS_URL/queue?account=:uuid`

The old backend expects `?account=:uuid`. Do not change this in the frontend until backend compatibility is intentionally changed.

## Remaining weaknesses

- React 17 + React Router 5 + class components are legacy.
- MobX decorators are still used.
- WebSocket open/error/close/reconnect logic is duplicated in four components.
- Payload guards are intentionally minimal; they do not yet fully validate every event subtype.
- There is no automated replay harness for fixtures.
- There are no Vitest/Testing Library tests yet.
- Audio behavior is still spread across components and donate templates.
- Overlay URL security is legacy-account based because the old backend stays unchanged.

## Recommended next PRs

1. `extract-legacy-overlay-socket-helper`
   - Extract shared socket/reconnect logic without changing protocol.

2. `add-overlay-fixture-replay`
   - Add a dev-only replay harness for fixtures.

3. `add-protocol-guard-tests`
   - Add Vitest tests for `legacyOverlayProtocol.ts` and `safeJson.ts`.

4. `replace-react-router-with-overlay-route-parser`
   - Optional later cleanup. Do not start before fixtures/replay exist.

5. `improve-audio-controller`
   - Centralize audio playback and error handling.
