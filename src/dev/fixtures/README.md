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

Routes: `/ALERTS/:uuid`, `/TIP_ALERT/:uuid`, `/REWARD_ALERT/:uuid`
WebSocket: `VITE_WS_URL?account=:uuid`

## Queue overlay

- `queue-set.json`
- `queue-add.json`
- `queue-delete.json`

Route: `/QUEUE/:uuid`
WebSocket: `VITE_WS_URL/queue?account=:uuid`

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


## Fixture replay examples

```txt
/ALERTS/:uuid?fixture=main-donate-prepare
/ALERTS/:uuid?test=true&fixture=main-donate-prepare
/SUB_GOAL/:uuid?fixture=subs-set
/SUB_GOAL/:uuid?test=true&fixture=subs-set
/FOLLOW_GOAL/:uuid?fixture=followers-set
/FOLLOW_GOAL/:uuid?test=true&fixture=followers-set
/QUEUE/:uuid?fixture=queue-set
/QUEUE/:uuid?test=true&fixture=queue-set
```

## Removed routes should be rejected

Removed historical `/channel/*` and `/test/channel/*` routes may appear only in rejection checks, not fixture replay examples.

Overlay URLs should not be shown publicly.
