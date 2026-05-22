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

Route: `/channel/:uuid`
WebSocket: `VITE_WS_URL?account=:uuid`

## Queue overlay

- `queue-set.json`
- `queue-add.json`
- `queue-delete.json`

Route: `/channel/:uuid/queue`
WebSocket: `VITE_WS_URL/queue?account=:uuid`

Important: `queue[0]` is the active event and is intentionally hidden by the queue overlay. Waiting items start at `queue.slice(1)`.

## Goal overlays

- `subs-set.json`
- `subs-update.json`
- `followers-set.json`
- `followers-update.json`

Routes:

- `/channel/:uuid/subs`
- `/channel/:uuid/followers`

WebSockets:

- `VITE_WS_URL/subs?account=:uuid`
- `VITE_WS_URL/followers?account=:uuid`
