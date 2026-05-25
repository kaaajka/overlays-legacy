# Backend contract snapshot 2026

## 1. Scope

This document describes the legacy backend contract currently used by `overlays-legacy`.

It is a snapshot of the existing backend/frontend overlay protocol, not a redesigned protocol and not a proposal for a new API. The old backend is treated as fixed. Frontend hardening, tests and documentation must remain compatible with the payloads described here unless the backend contract is intentionally changed in a separate backend task.

## 2. WebSocket channels

The frontend consumes four legacy WebSocket channels derived from `VITE_WS_URL` and the public overlay account UUID. Frontend environment parsing lives in `src/config/env.ts`: `wsUrl` uses `VITE_WS_URL` when present and falls back to `wss://kaaajka.nedi.me/ws` when missing or empty. This fallback is part of the current frontend runtime behavior and should not be changed casually because existing deployments depend on stable WebSocket URL shapes.

| Channel | Frontend component | Current active routes | Normal WebSocket URL | Test-mode WebSocket URL |
| --- | --- | --- | --- | --- |
| Main alert overlay NORMAL websocket | `PageChannel` | `/ALERTS/:uuid`, `/TIP_ALERT/:uuid`, `/REWARD_ALERT/:uuid` | `VITE_WS_URL?account=:uuid` | `VITE_WS_URL?account=:uuid&test=true` |
| Subscriber goal websocket | `PageChannelSubs` | `/SUB_GOAL/:uuid` | `VITE_WS_URL/subs?account=:uuid` | `VITE_WS_URL/subs?account=:uuid&test=true` |
| Follower goal websocket | `PageChannelFollowers` | `/FOLLOW_GOAL/:uuid` | `VITE_WS_URL/followers?account=:uuid` | `VITE_WS_URL/followers?account=:uuid&test=true` |
| Queue websocket | `PageChannelQueue` | `/QUEUE/:uuid` | `VITE_WS_URL/queue?account=:uuid` | `VITE_WS_URL/queue?account=:uuid&test=true` |

`/` renders the Home/link generator page and does not open a WebSocket. Overlay URLs should not be shown publicly.

Removed historical routes are not active and should render `Overlay not found`:

```txt
/channel/*
/test/channel/*
```

The explicit routes do not imply new backend endpoints. The `:uuid` route parameter is still passed to the backend as `?account=:uuid`. Runtime `?test=true` causes the frontend to append `test=true` to the WebSocket URL, but existing legacy backends do not need to read it. Existing backend test commands already emit test-shaped event names and are filtered by the frontend.

Normal mode accepts only normal main event names: `prepare`, `started`, `update`, `finished` and `alertList` where relevant. Test mode accepts only `test`, `t_prepare`, `t_started`, `t_update`, `t_finished`.

## 3. Main overlay payload shape

The main alert overlay consumes legacy NORMAL websocket messages. Observed message shapes include:

```json
{ "event": "prepare", "id": "event-id", "key": "donate", "args": {} }
```

```json
{ "event": "started", "id": "event-id", "key": "roulette", "args": {} }
```

```json
{ "event": "update", "id": "event-id", "key": "roulette", "args": {} }
```

```json
{ "event": "finished", "id": "event-id", "key": "roulette" }
```

```json
{ "event": "alertList", "id": "alert-list-id", "key": "set", "args": {} }
```

The frontend treats `event`, `id`, `key` and `args` as a legacy websocket boundary. Unknown payloads should be ignored safely, not crash the overlay.

## 4. Main event keys

Known main overlay keys include:

- `donate`
- `censure`
- `mute`
- `withoutR`
- `dogs`
- `roulette`
- `coinflip`
- `playSound`

`playSound` is used as a main-overlay command-style event where applicable. It is not a separate websocket channel.

## 5. Donate / Tipply payload

Donate alerts use:

```json
{
  "event": "prepare",
  "key": "donate",
  "id": "donate-id",
  "args": {
    "id": "donate-id",
    "nickname": "Michaś",
    "amount": 300,
    "commission": 29,
    "message": "debugowanie...",
    "audio_url": null,
    "test": false,
    "resent": false,
    "tts_nickname_google_male": "https://example.com/nickname.mp3",
    "tts_message_google_male": "https://example.com/message.mp3",
    "tts_amount_google_male": "https://example.com/amount.mp3"
  }
}
```

Production data flow is:

```txt
Tipply -> legacy backend -> WebSocket -> overlays-legacy frontend
```

The frontend does not consume raw Tipply webhooks. Tipply-derived fields may be forwarded inside `args` by the legacy backend.

`/TIP_ALERT/:uuid` currently filters main overlay traffic to donate events only, using `key === "donate"`.

Runtime test/prod overlay mode is selected only by the URL query `?test=true`.

TTS URLs are backend-provided dynamic URLs. Template GIFs, music, sounds and other visual media are frontend-owned local assets.

## 6. Roulette payload

For roulette started events, the backend sends:

```txt
args.items = event.items
```

The frontend maps `args.items` to `IRouletteItemSchema[]`.

Roulette items include the currently observed fields:

- `name`
- `tickets`
- `image`
- `start`
- `end`
- `chance`
- backend `key` may also be present

For started events, `start`, `end` and `chance` are expected after backend recalculation. The frontend should not independently recalculate the backend contract.

## 7. Coinflip payload

For coinflip started events, the backend sends:

```txt
args.segments = event.segments
```

The frontend maps `args.segments` to `ICoinflipSegmentSchema[]`.

Coinflip segments include the currently observed fields:

- `name`
- `image`
- `chance`
- backend `key` may also be present

The frontend should treat these as legacy backend-provided segment payloads, not local generated schema replacements.

## 8. Update payload

Update messages use a dynamic legacy payload shape:

```json
{
  "event": "update",
  "id": "event-id",
  "key": "roulette",
  "args": {
    "key": "fieldName",
    "value": "new value"
  }
}
```

`EventModel.update` currently applies dynamic model updates from this shape. This is an intentional legacy dynamic boundary.

The remaining dynamic assignment in `EventModel.update` should not be replaced with fake weak types. Proper removal requires a typed model-update contract and probably per-event update schemas.

## 9. Reward limitation

Older backend payloads do not include stable reward-origin metadata. In that legacy mode, current backend reward redemption events and manual `createEvent` events both use the legacy `pushEvent()` path and the frontend can only filter reward-like events by `key`, including:

- `censure`
- `mute`
- `withoutR`
- `dogs`
- `roulette`
- `coinflip`

The frontend is now prepared for optional top-level origin metadata:

```json
{
  "event": "started",
  "id": "event-id",
  "key": "roulette",
  "origin": "reward",
  "args": {}
}
```

If `origin` is present, `/REWARD_ALERT/:uuid` prefers it: `origin === "reward"` is accepted and `origin === "manual"` is rejected. If `origin` is missing, `/REWARD_ALERT/:uuid` falls back to the legacy reward-like key filter.

This still is not full Twitch reward-origin isolation unless the backend consistently sends origin/source metadata. Manual `createEvent` events using reward-like keys may appear in `/REWARD_ALERT/:uuid` when the backend omits `origin`. True reward-only isolation requires backend origin/source metadata, stable reward ids/redemption ids, or a dedicated backend channel/scope.

## 10. Future protocol improvements

Safe future improvements should be handled as backend/frontend contract work, not hidden frontend assumptions.

Recommended improvements:

1. Consistently add `origin: "reward" | "manual" | "system"` to backend payloads.
2. Add stable reward metadata where applicable, for example `rewardId` or `redemptionId`.
3. Add runtime validators for payload `args` at the frontend protocol boundary.
4. Split dynamic update payloads into typed per-event update schemas.
5. Consider dedicated backend channels or query scopes only after the current legacy contract is fully preserved and migrated deliberately.
