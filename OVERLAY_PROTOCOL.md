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

Runtime URL creation is centralized in `src/protocol/legacyWsUrl.ts`. That helper is intentionally small and only preserves the frozen legacy mapping:

| Socket kind | Final WebSocket URL |
| --- | --- |
| `main` | `VITE_WS_URL?account=:uuid` |
| `subs` | `VITE_WS_URL/subs?account=:uuid` |
| `followers` | `VITE_WS_URL/followers?account=:uuid` |
| `queue` | `VITE_WS_URL/queue?account=:uuid` |

Do not change this helper to introduce token auth, new query params, or new endpoint names while this repo targets the old backend.

## Route: main overlay

### URL

```txt
/channel/:uuid
```

### WebSocket

```txt
VITE_WS_URL?account=:uuid
```

### Purpose

Main overlay for stream events, donate alerts, roulette, coinflip, normal events, sounds and alert queue acknowledgement.

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

- Do not remove `/channel/:uuid*` routes without adding backward-compatible aliases.
- Do not replace `?account=:uuid` while the legacy backend is still used.
- Do not remove `t_prepare`, `t_started`, `t_update`, `t_finished` support unless the legacy backend test commands are removed.
- Do not assume every backend payload is valid; guard and ignore invalid messages.
