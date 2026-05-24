# Kaaajka legacy overlays frontend - 2026 deploy notes

This project is a legacy OBS overlay frontend migrated from Create React App to Vite. The goal is stable static hosting while preserving compatibility with the old backend.

## Stack

- Vite
- React 17
- React Router 5
- MobX + `mobx-react`
- Sass
- pnpm 10.17.1

## Runtime contract

The old backend is not changed. Existing OBS URLs remain valid:

```txt
/channel/:uuid
/channel/:uuid/subs
/channel/:uuid/followers
/channel/:uuid/queue
```

New OBS sources should prefer the additive uppercase route aliases:

```txt
/TIP_ALERT/:uuid
/REWARD_ALERT/:uuid
/SUB_GOAL/:uuid
/FOLLOW_GOAL/:uuid
/QUEUE/:uuid
```

Both legacy routes and aliases use the same WebSocket contract and support the same dev fixture query parameters. Main alert routes use one shared `PageChannel` component with route modes:

- `/channel/:uuid` uses `all` mode and accepts all current main overlay events.
- `/TIP_ALERT/:uuid` uses `tip` mode and accepts donate events only (`key === "donate"`).
- `/REWARD_ALERT/:uuid` uses `reward` mode and accepts reward-like legacy keys: `censure`, `mute`, `withoutR`, `dogs`, `roulette`, and `coinflip`.

`/REWARD_ALERT/:uuid` does not create `/ws/rewards` or any separate backend endpoint. Manual `createEvent` events with the same keys may also appear in `REWARD_ALERT`. True reward-origin isolation requires backend origin/source metadata or a dedicated backend channel.

WebSocket endpoints are derived from `VITE_WS_URL`:

```txt
main      -> VITE_WS_URL?account=:uuid
subs      -> VITE_WS_URL/subs?account=:uuid
followers -> VITE_WS_URL/followers?account=:uuid
queue     -> VITE_WS_URL/queue?account=:uuid
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
pnpm exec tsc --noEmit
```

## Environment variables

```env
VITE_APP_ENV=prod
VITE_WS_URL=wss://kaaajka.nedi.me/ws
VITE_DEBUG_LOGS=false
```

`VITE_DEBUG_LOGS=true` enables debug logs in production-like environments. Keep it off for OBS production scenes unless diagnosing a problem.

## Vercel

Build is controlled by `vercel.json`.

Expected settings:

- Install command: Corepack + `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: `dist`

The package currently pins Node to `22.x` for stable legacy deployment. Move to Node 24 only through a separate verified PR.

## Netlify

Build command:

```txt
pnpm run build
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
pnpm run build
pnpm exec tsc --noEmit
```



Invalid UUID paths should show the small `Overlay not found` screen. Valid-format UUIDs that cannot connect to the legacy backend should show `Overlay unavailable` after repeated WebSocket failures instead of reconnecting aggressively forever.

Manual route check:

```txt
/channel/:uuid
/channel/:uuid/subs
/channel/:uuid/followers
/channel/:uuid/queue
/TIP_ALERT/:uuid
/REWARD_ALERT/:uuid
/SUB_GOAL/:uuid
/FOLLOW_GOAL/:uuid
/QUEUE/:uuid
```

Expected runtime:

- no red runtime errors from the app bundle,
- WebSocket connects on valid routes,
- debug `console.log` output is hidden unless `VITE_DEBUG_LOGS=true`.


## Runtime routing parser

Runtime overlay routing is now resolved by `src/routing/parseOverlayRoute.ts` in `src/index.tsx` instead of React Router runtime matching. This keeps the legacy `/channel/:uuid` OBS routes and the modern uppercase aliases compatible while sharing one tested parser for UUID validation and route mapping.

React Router dependencies are intentionally still present in `package.json` for this commit; dependency cleanup should happen only after manual OBS validation. Query parameters such as `fixture`, `muteAudio` and `fast` still come from `window.location.search`, so fixture replay behavior is unchanged.
