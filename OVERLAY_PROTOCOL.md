# Legacy Overlay Protocol 2026

This document freezes the current legacy OBS overlay contract. The old backend is treated as fixed. The frontend may be hardened and documented, but it must remain compatible with the payloads and routes below.

## Global rules

- The frontend is an OBS Browser Source client, not a dashboard.
- All routes use the legacy public channel UUID as `:uuid`.
- The backend identifies the overlay by `?account=:uuid`.
- The frontend must not require backend payload changes.
- Unknown payloads should be ignored safely and logged only through `debugLog`.
- Existing OBS URLs must remain valid.

## Environment

```env
VITE_WS_URL=wss://kaaajka.nedi.me/ws
VITE_APP_ENV=prod
VITE_DEBUG_LOGS=false
```

`VITE_WS_URL` is the base WebSocket URL. Route-specific overlays append a path and `?account=:uuid`.

Runtime URL creation is centralized in `src/socket/buildOverlaySocketUrl.ts`. The old `src/protocol/legacyWsUrl.ts` helper is only a compatibility wrapper around the tested socket URL builders. The mapping is intentionally small and only preserves the frozen legacy contract:

| Socket kind | Final WebSocket URL |
| --- | --- |
| `main` | `VITE_WS_URL?account=:uuid` |
| `subs` | `VITE_WS_URL/subs?account=:uuid` |
| `followers` | `VITE_WS_URL/followers?account=:uuid` |
| `queue` | `VITE_WS_URL/queue?account=:uuid` |

Do not change this helper to introduce token auth, new query params, or new endpoint names while this repo targets the old backend.

## Overlay routes

The original `/channel` URLs are legacy OBS routes and must keep working. New uppercase route aliases are preferred for newly-created browser sources, but they intentionally reuse the same components, query parameters and WebSocket URL builder. Use `/ALERTS/:uuid` for new all-events main overlay sources; keep `/channel/:uuid` as a deprecated legacy alias because old OBS/browser sources may still depend on it.

| Overlay | Legacy route | Preferred route alias |
| --- | --- | --- |
| Main alert overlay, all legacy event keys | `/channel/:uuid` deprecated legacy alias | `/ALERTS/:uuid` |
| Tip/donate-only main overlay mode | - | `/TIP_ALERT/:uuid` |
| Reward-like main overlay mode | - | `/REWARD_ALERT/:uuid` |
| Subscriber goal | `/channel/:uuid/subs` | `/SUB_GOAL/:uuid` |
| Follower goal | `/channel/:uuid/followers` | `/FOLLOW_GOAL/:uuid` |
| Queue | `/channel/:uuid/queue` | `/QUEUE/:uuid` |

`?fixture=<name>`, `&muteAudio=true` and `&fast=true` work on both legacy routes and preferred aliases. Invalid or unsupported overlay URLs render a minimal `Overlay not found` screen instead of a blank page.

Main alert route modes share the same `PageChannel` component and the same legacy main WebSocket endpoint, but apply minimal frontend filtering:

- `/ALERTS/:uuid` runs in `all` mode and is the recommended modern all-events route.
- `/channel/:uuid` also runs in `all` mode, but is a deprecated legacy alias kept for existing OBS/browser sources.
- `/TIP_ALERT/:uuid` runs in `tip` mode and accepts donate events only (`key === "donate"`).
- `/REWARD_ALERT/:uuid` runs in `reward` mode. If a payload includes optional top-level `origin`, reward mode prefers it: `origin === "reward"` is accepted and `origin === "manual"` is rejected. If `origin` is missing, reward mode preserves legacy behavior and falls back to reward-like key filtering for `censure`, `mute`, `withoutR`, `dogs`, `roulette`, and `coinflip`.

`/REWARD_ALERT/:uuid` does not create a separate backend WebSocket endpoint and does not use `/ws/rewards`. With older backend payloads that do not include `origin`, manual `createEvent` events with the same legacy keys may still appear in `REWARD_ALERT`. True reward-origin isolation requires backend origin/source metadata, such as a reward discriminator, reward id, redemption id, or a dedicated backend channel.



## Invalid routes vs unavailable overlays

Route validation only checks URL syntax. Malformed or missing UUIDs, for example `/QUEUE/not-a-uuid` or `/channel/not-a-uuid`, should render the minimal `Overlay not found` screen.

A syntactically valid UUID can still point to a missing or disabled legacy overlay account. The router cannot know that. In that case the overlay opens the normal legacy WebSocket URL, retries a small number of times, and then renders:

```text
Overlay unavailable
Could not connect to this overlay. Check widget URL or backend status.
```

This is a frontend failure state only. It does not change the WebSocket URL format, backend payloads, account lookup model, fixture replay, or OBS route contract.

All overlay WebSocket clients (`main`, `queue`, `subs`, `followers`) share their connection lifecycle through `src/socket/createLegacyOverlaySocket.ts`. That helper only centralizes connect/reconnect/failure/send handling; it must not change the frozen legacy URL contract or payload contract. The main tip alert overlay still owns donate, alert, roulette, coinflip, playSound and acceptAlert handling inside `PageChannel.tsx`; only its socket lifecycle is shared.

## Route: main overlay

### URL

```txt
/ALERTS/:uuid
/channel/:uuid
/TIP_ALERT/:uuid
/REWARD_ALERT/:uuid
```

### WebSocket

```txt
VITE_WS_URL?account=:uuid
```

### Purpose

Main overlay for stream events, donate alerts, roulette, coinflip, normal events, sounds and alert queue acknowledgement. Route mode controls which legacy event keys are handled by the shared `PageChannel` component: `/ALERTS/:uuid` handles all and is preferred for new OBS sources, `/channel/:uuid` handles all as a deprecated legacy alias, `/TIP_ALERT/:uuid` handles donate only, and `/REWARD_ALERT/:uuid` handles reward-like legacy keys only.

### Incoming: alert list set

```json
{
  "event": "alertList",
  "key": "set",
  "id": "alert-list-init",
  "args": {
    "list": ["donate-alert-1", "donate-alert-2"]
  }
}
```

The frontend stores the alert queue and submits the first alert through `acceptAlert`.

### Incoming: alert list add/delete

```json
{
  "event": "alertList",
  "key": "add",
  "id": "alert-list-add",
  "args": {
    "id": "donate-alert-3"
  }
}
```

```json
{
  "event": "alertList",
  "key": "delete",
  "id": "alert-list-delete",
  "args": {
    "id": "donate-alert-1"
  }
}
```

### Incoming: donate prepare

```json
{
  "event": "prepare",
  "key": "donate",
  "id": "donate-alert-1",
  "args": {
    "id": "donate-alert-1",
    "nickname": "TestUser",
    "message": "Testowy donejt",
    "amount": 5000,
    "commission": 0,
    "test": false,
    "resent": false,
    "tts_nickname_google_male": "",
    "tts_nickname_google_female": "",
    "tts_message_google_male": "",
    "tts_message_google_female": "",
    "tts_amount_google_male": "",
    "tts_amount_google_female": ""
  }
}
```

The frontend selects a donate template by amount, plays template audio/TTS, renders the donate and calls `onFinished` after the sequence.

## Donate data ownership

The frontend does not integrate directly with Tipply. The production data flow is:

```txt
Tipply -> legacy backend -> WebSocket -> overlays-legacy frontend
```

Frontend donate fixtures and protocol tests must represent the backend WebSocket message, not the raw Tipply webhook. The legacy frontend should care about the wrapper shape:

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

Ownership rules:

- The frontend receives donate data only from our backend WebSocket.
- The backend may forward Tipply-derived fields inside `args`.
- TTS URLs come from backend payloads. The frontend must not generate TTS.
- The frontend must tolerate `audio_url: null`.
- The frontend must tolerate missing female TTS fields.
- The frontend must not require `email`, `receiver_id`, `payment_id`, payment method fields, or other backend-only/payment fields.
- Static overlay template assets, such as music, sounds, GIFs, images and template media, are frontend-owned and should live in the frontend project, preferably under `public/`.
- Donate template GIFs live under `public/media/gif/` and are referenced through `AppConfig.assetUrl("/media/gif/<template>.<ext>")`.
- Donate template music/audio lives under `public/media/audio/` and is referenced through `AppConfig.assetUrl("/media/audio/<template>.<ext>")`.
- Template media must not load from `https://tipply.pl/upload/media/user/...` or old Tipply/CloudFront media URLs.
- Backend-provided TTS/audio URLs are dynamic and should be normalized only as backend URLs: absolute `http(s)` values stay unchanged; Tipply-relative paths are prefixed with `https://tipply.pl`.
- Current local donate template media files are `1-7` for GIFs and audio. Higher amount templates reuse the available local tier-7 media until dedicated `8.*`, `9.*` or `10.*` files are added.
- Do not move TTS into `public/`.
- Do not make production frontend logic depend on fake local TTS files.

A raw Tipply webhook may be useful as documentation for the backend, but it is upstream backend input, not a frontend WebSocket payload. Do not place raw Tipply webhooks in `src/dev/fixtures` as frontend protocol fixtures.


Dev fixture replay may skip audio with `?fixture=<name>&muteAudio=true` or `muteAudio=1`. This is a development-only convenience for browser autoplay policy noise. It must not change production OBS behavior, normal backend WebSocket mode, payload shape, donate template selection, or event lifecycle. Muted fixture replay still preserves approximate donate timing by waiting simulated audio durations. For fast logic-only checks, `&fast=true` or `&fast=1` skips those simulated delays too.

When fixture replay is active and audio is not muted, browser preview shows a dev-only audio unlock prompt before replaying the fixture. The fixture starts only after the user clicks, so local template audio and backend-provided TTS are attempted after a browser user gesture. Normal routes without `fixture` must never show this prompt.

### Incoming: event lifecycle

The legacy backend sends event lifecycle messages using:

```txt
prepare -> started -> update -> finished
```

In test mode it may also send:

```txt
t_prepare -> t_started -> t_update -> t_finished
```

The frontend must keep supporting these test-prefixed events.

### Incoming: roulette prepare/started

```json
{
  "event": "prepare",
  "key": "roulette",
  "id": "roulette-1",
  "args": {
    "name": "Ruletka",
    "description": "Testowa ruletka",
    "items": []
  }
}
```

```json
{
  "event": "started",
  "key": "roulette",
  "id": "roulette-1",
  "args": {
    "name": "Ruletka",
    "description": "Testowa ruletka",
    "time": 20,
    "winner": 1,
    "items": []
  }
}
```

### Incoming: coinflip prepare/started

```json
{
  "event": "prepare",
  "key": "coinflip",
  "id": "coinflip-1",
  "args": {
    "name": "Coinflip",
    "description": "Testowy coinflip",
    "segments": []
  }
}
```

```json
{
  "event": "started",
  "key": "coinflip",
  "id": "coinflip-1",
  "args": {
    "name": "Coinflip",
    "description": "Testowy coinflip",
    "time": 10,
    "winner": 1,
    "coin_landing_side": 1,
    "segments": []
  }
}
```

### Incoming: update

```json
{
  "event": "update",
  "key": "roulette",
  "id": "roulette-1",
  "args": {
    "key": "time",
    "value": 15
  }
}
```

The frontend applies the update only when the active event id matches `id`.

### Incoming: finished

```json
{
  "event": "finished",
  "key": "roulette",
  "id": "roulette-1",
  "args": {}
}
```

The frontend clears the active event when ids match.

### Incoming: playSound

```json
{
  "event": "prepare",
  "key": "playSound",
  "id": "sound-1",
  "args": {
    "url": "https://example.com/sound.mp3",
    "volume": 0.5
  }
}
```

### Outgoing: accept alert

```json
{
  "type": "acceptAlert",
  "args": {
    "id": "donate-alert-1"
  }
}
```

The frontend sends this to accept the first queued donate alert.

### Outgoing: create event legacy test helper

```json
{
  "type": "createEvent",
  "args": {
    "name": "roulette"
  }
}
```

This is a legacy test/development message. Do not remove it if backend test tooling still uses it.

## Route: subs goal

### URL

```txt
/channel/:uuid/subs
/SUB_GOAL/:uuid
```

### WebSocket

```txt
VITE_WS_URL/subs?account=:uuid
```

### Purpose

Standalone OBS widget for the current subscription goal.

### Incoming: set

```json
{
  "type": "set",
  "args": {
    "current": 12,
    "goal": 25
  }
}
```

### Incoming: update

```json
{
  "type": "update",
  "args": {
    "current": 13
  }
}
```

`update` merges partial values and must not reset missing fields to `undefined`.

## Route: followers goal

### URL

```txt
/channel/:uuid/followers
/FOLLOW_GOAL/:uuid
```

### WebSocket

```txt
VITE_WS_URL/followers?account=:uuid
```

### Purpose

Standalone OBS widget for the current followers goal.

The message shape matches the subs goal route.

## Route: queue overlay

### URL

```txt
/channel/:uuid/queue
/QUEUE/:uuid
```

### WebSocket

```txt
VITE_WS_URL/queue?account=:uuid
```

### Purpose

Standalone OBS widget for queued events.

### Incoming: set

```json
{
  "event": "queue",
  "key": "set",
  "id": "queue-set-1",
  "args": {
    "list": [
      { "id": "active-1", "name": "Aktywny event", "username": "System" },
      { "id": "queued-1", "name": "Ruletka", "username": "ViewerOne" }
    ]
  }
}
```

### Incoming: add

```json
{
  "event": "queue",
  "key": "add",
  "id": "queue-add-1",
  "args": {
    "id": "queued-2",
    "name": "Coinflip",
    "username": "ViewerTwo"
  }
}
```

### Incoming: delete

```json
{
  "event": "queue",
  "key": "delete",
  "id": "queue-delete-1",
  "args": {
    "id": "queued-1"
  }
}
```

### Important queue behavior

`queue[0]` is treated as the currently active event. The queue overlay intentionally renders `queue.slice(1)`, meaning only waiting items are visible. This is legacy backend semantics, not a frontend bug.

## Compatibility notes

- Do not remove `/channel/:uuid*` legacy routes. `/ALERTS/:uuid` is the recommended all-events route for new OBS sources, but the legacy `/channel/:uuid` URLs must keep working until old OBS/browser sources are migrated.
- Do not replace `?account=:uuid` while the legacy backend is still used.
- Do not remove `t_prepare`, `t_started`, `t_update`, `t_finished` support unless the legacy backend test commands are removed.
- Do not assume every backend payload is valid; guard and ignore invalid messages.


## Runtime routing parser

Runtime overlay routing is now resolved by `src/routing/parseOverlayRoute.ts` in `src/index.tsx` instead of React Router runtime matching. This keeps the legacy `/channel/:uuid` OBS routes and the modern uppercase aliases compatible while sharing one tested parser for UUID validation and route mapping. The parser preserves distinct `ALERTS` and `REWARD_ALERT` route types so runtime can pass `all` or `reward` mode into the shared main overlay.

React Router dependencies are intentionally still present in `package.json` for this commit; dependency cleanup should happen only after manual OBS validation. Query parameters such as `fixture`, `muteAudio` and `fast` still come from `window.location.search`, so fixture replay behavior is unchanged.
