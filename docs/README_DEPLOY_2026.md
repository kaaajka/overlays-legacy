# Kaaajka legacy overlays frontend - 2026 deploy notes

This project is a legacy OBS overlay frontend migrated from Create React App to Vite. The goal is stable static hosting while preserving compatibility with the old backend payloads.

## Stack

- Vite
- React 17
- MobX + `mobx-react`
- Sass
- Node.js 24 LTS
- pnpm 10.17.1

## Runtime

- Node.js 24 LTS
- pnpm 10.17.1

Use Corepack so the pinned `packageManager` value in `package.json` activates the expected pnpm version. Local shells and deployment providers should use `.nvmrc` / `.node-version` and the `engines.node` field as the Node 24 source of truth.

## Runtime contract

The old backend is not changed. The active frontend route contract is explicit-route only:

```txt
/
/ALERTS/:uuid
/TIP_ALERT/:uuid
/REWARD_ALERT/:uuid
/SUB_GOAL/:uuid
/FOLLOW_GOAL/:uuid
/QUEUE/:uuid
```

`/` renders the Home/link generator page. It does not connect to the backend.

Removed historical routes are not supported:

```txt
/channel/*
/test/channel/*
```

Overlay URLs should not be shown publicly.

## Runtime test mode

Use one build only. Test mode is selected at runtime with `?test=true`:

```txt
/ALERTS/:uuid?test=true
/TIP_ALERT/:uuid?test=true
/REWARD_ALERT/:uuid?test=true
/SUB_GOAL/:uuid?test=true
/FOLLOW_GOAL/:uuid?test=true
/QUEUE/:uuid?test=true
```

The old two-build model is removed. Do not document or reintroduce:

```txt
build:test
PUBLIC_URL=/test/
build-time test route prefix
/test/channel/*
```

Normal main overlay mode accepts only:

```txt
prepare
started
update
finished
alertList
```

Runtime test mode accepts only:

```txt
test
t_prepare
t_started
t_update
t_finished
```

Existing legacy backend test commands do not require backend changes because test traffic is identified by event names. The frontend also appends `test=true` to the WebSocket URL for future backend support; existing backends may ignore it.

## Main alert route modes

Main alert routes use one shared `PageChannel` component with route modes:

- `/ALERTS/:uuid` uses `all` mode and accepts all normal alert types.
- `/TIP_ALERT/:uuid` uses `tip` mode and accepts donate events only (`key === "donate"`).
- `/REWARD_ALERT/:uuid` uses `reward` mode and accepts reward-origin events when `origin === "reward"`; without origin metadata it falls back to reward-like legacy keys: `censure`, `mute`, `withoutR`, `dogs`, `roulette`, and `coinflip`.

`/REWARD_ALERT/:uuid` does not create `/ws/rewards` or any separate backend endpoint. Manual `createEvent` events with the same keys may also appear in `REWARD_ALERT` when backend payloads omit origin metadata. True reward-origin isolation requires backend origin/source metadata or a dedicated backend channel.

## WebSocket endpoints

WebSocket endpoints are derived from `VITE_WS_URL`:

```txt
normal main      -> VITE_WS_URL?account=:uuid
normal subs      -> VITE_WS_URL/subs?account=:uuid
normal followers -> VITE_WS_URL/followers?account=:uuid
normal queue     -> VITE_WS_URL/queue?account=:uuid

test main        -> VITE_WS_URL?account=:uuid&test=true
test subs        -> VITE_WS_URL/subs?account=:uuid&test=true
test followers   -> VITE_WS_URL/followers?account=:uuid&test=true
test queue       -> VITE_WS_URL/queue?account=:uuid&test=true
```

See `OVERLAY_PROTOCOL.md` for payload details.

## Local commands

```bash
corepack enable
corepack prepare pnpm@10.17.1 --activate
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
pnpm typecheck
```

## Environment variables

Frontend environment parsing is centralized in `src/config/env.ts`. Runtime overlay test/prod mode is selected only by `?test=true` on the overlay URL.

```env
VITE_WS_URL=wss://kaaajka.nedi.me/ws
VITE_DEBUG_LOGS=false
```

### `VITE_WS_URL`

`VITE_WS_URL` is optional. When it is provided, `AppConfig.ws` uses that value to build the legacy overlay websocket URLs.

When `VITE_WS_URL` is missing or empty, the frontend keeps the legacy fallback:

```txt
wss://kaaajka.nedi.me/ws
```

This fallback is intentional so old payload-compatible deployments do not fail with a blank screen just because an environment variable was omitted during static hosting setup.

### `VITE_DEBUG_LOGS`

`VITE_DEBUG_LOGS=true` enables debug logs in production-like environments. Keep it off for OBS production scenes unless diagnosing a problem.

## Vercel

Build is controlled by `vercel.json`.

Expected settings:

- Install command: Corepack + `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: `dist`

The package pins Node to `24.x`; Vercel should use Node.js 24 LTS and pnpm 10.17.1 through Corepack.

## Netlify

Build command:

```txt
pnpm run build
```

Runtime:

```txt
Node.js 24 LTS
pnpm 10.17.1
```

Publish directory:

```txt
dist
```

## Source-control rules

Do not commit:

- `.env`
- `dist/`
- `node_modules/`

Do commit:

- `package.json`
- `pnpm-lock.yaml`
- `src/`
- `public/`
- Vite/Vercel/Netlify config files
- protocol and QA docs

## Verification before merge

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Invalid UUID paths should show the small `Overlay not found` screen. Valid-format UUIDs that cannot connect to the legacy backend should show `Overlay unavailable` after repeated WebSocket failures instead of reconnecting aggressively forever.

Manual route check:

```txt
/
/ALERTS/:uuid
/TIP_ALERT/:uuid
/REWARD_ALERT/:uuid
/SUB_GOAL/:uuid
/FOLLOW_GOAL/:uuid
/QUEUE/:uuid
/ALERTS/:uuid?test=true
/TIP_ALERT/:uuid?test=true
/REWARD_ALERT/:uuid?test=true
/SUB_GOAL/:uuid?test=true
/FOLLOW_GOAL/:uuid?test=true
/QUEUE/:uuid?test=true
```

Removed-route check:

```txt
/channel/:uuid
/channel/:uuid/subs
/channel/:uuid/followers
/channel/:uuid/queue
/test/channel/:uuid
```

Expected runtime:

- no red runtime errors from the app bundle,
- Home page renders the link generator at `/`,
- WebSocket connects on valid overlay routes,
- removed routes render `Overlay not found`,
- debug `console.log` output is hidden unless `VITE_DEBUG_LOGS=true`.

## Runtime routing parser

Runtime overlay routing is resolved by `src/routing/parseOverlayRoute.ts` in `src/index.tsx` instead of React Router runtime matching. The parser accepts `/` as Home, accepts only explicit uppercase overlay routes, rejects `/channel/*` and `/test/channel/*`, validates UUID syntax and exposes `testMode: boolean` only when `?test=true` is present.

Query parameters such as `fixture`, `muteAudio` and `fast` still come from `window.location.search`, so fixture replay behavior is unchanged.
