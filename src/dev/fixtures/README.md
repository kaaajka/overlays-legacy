# Legacy Overlay Fixtures

These JSON files mirror the legacy backend WebSocket payloads. They are intentionally compatible with the old backend protocol and should not be redesigned without backend changes.

Use them for manual testing, future replay tooling and contract documentation.

## Main overlay

- `main-alert-list-set.json`
- `main-donate-prepare.json`
- `main-roulette-prepare.json`
- `main-roulette-started.json`
- `main-coinflip-prepare.json`
- `main-coinflip-started.json`

Routes:

- `/ALERTS/:uuid`
- `/TIP_ALERT/:uuid`
- `/REWARD_ALERT/:uuid`

WebSocket: `VITE_WS_URL?account=:uuid`

Test mode: append `?test=true` to the route. The test-mode WebSocket appends `&test=true` and accepts only `test`, `t_prepare`, `t_started`, `t_update`, `t_finished` event names.

## Queue overlay

- `queue-set.json`
- `queue-add.json`
- `queue-delete.json`

Route: `/QUEUE/:uuid`
WebSocket: `VITE_WS_URL/queue?account=:uuid`
Test mode route: `/QUEUE/:uuid?test=true`

Important: `queue[0]` is the active event and is intentionally hidden by the queue overlay. Waiting items start at `queue.slice(1)`.

## Goal overlays

- `subs-set.json`
- `subs-update.json`
- `followers-set.json`
- `followers-update.json`

Routes:

- `/SUB_GOAL/:uuid`
- `/FOLLOW_GOAL/:uuid`

WebSockets:

- `VITE_WS_URL/subs?account=:uuid`
- `VITE_WS_URL/followers?account=:uuid`

Test mode routes:

- `/SUB_GOAL/:uuid?test=true`
- `/FOLLOW_GOAL/:uuid?test=true`

## Removed historical routes

The following routes existed in the old build model but are not active now:

```txt
/channel/*
/test/channel/*
```

Do not use them in fixture replay examples.

Overlay URLs should not be shown publicly.
