# Kaaajka legacy overlays frontend - 2026 deploy notes

This project is a legacy OBS overlay frontend migrated from Create React App to Vite. The goal is stable static hosting while preserving compatibility with the old backend.

## Stack

- Vite
- React 17
- React Router 5
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

`/` renders the Home/link generator page and does not connect to the backend. Overlay URLs should not be shown publicly.

Removed historical routes are not supported and should render `Overlay not found`:

```txt
/channel/*
/test/channel/*
```

Runtime test mode uses the same explicit routes with `?test=true`:

```txt
/ALERTS/:uuid?test=true
/TIP_ALERT/:uuid?test=true
/REWARD_ALERT/:uuid?test=true
/SUB_GOAL/:uuid?test=true
/FOLLOW_GOAL/:uuid?test=true
/QUEUE/:uuid?test=true
```

Normal mode accepts only `prepare`, `started`, `update`, `finished` and `alertList` where relevant. Test mode accepts only `test`, `t_prepare`, `t_started`, `t_update`, `t_finished`. Existing backend test commands do not require backend changes because test traffic is identified by event names; the frontend appends `test=true` to the WebSocket URL for future backend support.

Main alert routes use one shared `PageChannel` component with route modes:

- `/ALERTS/:uuid` uses `all` mode and accepts all current main overlay events.
- `/TIP_ALERT/:uuid` uses `tip` mode and accepts donate events only (`key === "donate"`).
- `/REWARD_ALERT/:uuid` uses `reward` mode and accepts reward-like legacy keys: `censure`, `mute`, `withoutR`, `dogs`, `roulette`, and `coinflip`.

`/REWARD_ALERT/:uuid` does not create `/ws/rewards` or any separate backend endpoint. Manual `createEvent` events with the same keys may also appear in `REWARD_ALERT`. True reward-origin isolation requires backend origin/source metadata or a dedicated backend channel.

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

Frontend environment parsing is centralized in `src/config/env.ts`. The module exposes `wsUrl` so overlay runtime code does not read Vite env values directly. Env parsing must stay tolerant: a missing or invalid env value should not blank-screen OBS overlays. It should be diagnosable without changing existing overlay URLs.

```env
VITE_WS_URL=wss://kaaajka.nedi.me/ws
VITE_DEBUG_LOGS=false
```

### `VITE_WS_URL`

`VITE_WS_URL` is optional. When it is provided, `AppConfig.ws` uses that value to build the legacy overlay websocket URLs:

```txt
main      -> VITE_WS_URL?account=:uuid
subs      -> VITE_WS_URL/subs?account=:uuid
followers -> VITE_WS_URL/followers?account=:uuid
queue     -> VITE_WS_URL/queue?account=:uuid
```

When `VITE_WS_URL` is missing or empty, the frontend keeps the legacy fallback:

```txt
wss://kaaajka.nedi.me/ws
```

This fallback is intentional so old OBS overlay URLs do not fail with a blank screen just because an environment variable was omitted during static hosting setup.

### Removed old app env overlay mode

`VITE_APP_ENV`/`appEnv` no longer controls prod/test overlay mode. Runtime test mode is query-based: `?test=true`.

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
/ALERTS/:uuid?test=true
/TIP_ALERT/:uuid
/TIP_ALERT/:uuid?test=true
/REWARD_ALERT/:uuid
/REWARD_ALERT/:uuid?test=true
/SUB_GOAL/:uuid
/FOLLOW_GOAL/:uuid
/QUEUE/:uuid
```

Historical removed-route rejection check:

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
- WebSocket connects on valid explicit overlay routes,
- removed routes render `Overlay not found`,
- debug `console.log` output is hidden unless `VITE_DEBUG_LOGS=true`.


## Runtime routing parser

Runtime overlay routing is resolved by `src/routing/parseOverlayRoute.ts` in `src/index.tsx` instead of React Router runtime matching. The parser accepts `/` as Home, accepts explicit overlay routes only, rejects `/channel/*` and `/test/channel/*`, validates UUID syntax and exposes `testMode: boolean` only when `?test=true` is present.

React Router dependencies are intentionally still present in `package.json` for this commit; dependency cleanup should happen only after manual OBS validation. Query parameters such as `fixture`, `muteAudio` and `fast` still come from `window.location.search`, so fixture replay behavior is unchanged.
