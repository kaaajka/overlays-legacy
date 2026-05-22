# OBS QA Checklist 2026

Use this checklist before treating an overlay deployment as production-ready.

## Environment

- [ ] Production URL points to the intended Vercel/Netlify deployment.
- [ ] `VITE_WS_URL` points to the intended legacy backend WebSocket endpoint.
- [ ] `VITE_APP_ENV=prod` unless testing legacy `t_*` events.
- [ ] `VITE_DEBUG_LOGS=false` for production.

## OBS Browser Source setup

- [ ] Browser Source uses the correct overlay URL.
- [ ] Browser Source size is tested at 1920x1080.
- [ ] Transparent background works.
- [ ] Custom CSS in OBS is disabled unless intentionally needed.
- [ ] Refresh browser when scene becomes active is tested.
- [ ] Shutdown source when not visible is tested.
- [ ] Audio monitoring/routing is tested.

## Routes

- [ ] `/channel/:uuid` loads without runtime errors.
- [ ] `/channel/:uuid/subs` loads without runtime errors.
- [ ] `/channel/:uuid/followers` loads without runtime errors.
- [ ] `/channel/:uuid/queue` loads without runtime errors.
- [ ] Invalid route does not affect valid overlay routes.

## WebSocket behavior

- [ ] Main overlay connects to `VITE_WS_URL?account=:uuid`.
- [ ] Subs overlay connects to `VITE_WS_URL/subs?account=:uuid`.
- [ ] Followers overlay connects to `VITE_WS_URL/followers?account=:uuid`.
- [ ] Queue overlay connects to `VITE_WS_URL/queue?account=:uuid`.
- [ ] Backend restart triggers reconnect.
- [ ] Short network interruption triggers reconnect.
- [ ] Duplicate event does not duplicate visible queue item unexpectedly.
- [ ] Invalid JSON payload is ignored and does not crash the overlay.

## Main overlay events

- [ ] Donate with short message renders and finishes.
- [ ] Donate with long message renders acceptably.
- [ ] Donate without TTS does not hang.
- [ ] Donate with TTS plays in expected order.
- [ ] `alertList set/add/delete` works.
- [ ] `acceptAlert` is sent for queued donate alerts.
- [ ] `playSound` plays sound once.
- [ ] Roulette `prepare/started/update/finished` works.
- [ ] Coinflip `prepare/started/update/finished` works.
- [ ] Normal event `prepare/started/update/finished` works.

## Goal widgets

- [ ] Subs `set` renders current and goal.
- [ ] Subs `update` updates only provided fields.
- [ ] Followers `set` renders current and goal.
- [ ] Followers `update` updates only provided fields.

## Queue widget

- [ ] Queue `set` stores all items.
- [ ] Queue intentionally hides first active item and renders waiting items.
- [ ] Queue `add` adds missing item only once.
- [ ] Queue `delete` removes matching item.
- [ ] Queue payload mutation does not trigger MobX strict-mode warnings.

## Long-run OBS test

- [ ] Overlay remains stable after 30 minutes idle.
- [ ] Overlay remains stable after 2 hours idle.
- [ ] Memory usage does not grow unusually after repeated events.
- [ ] Audio does not stack unexpectedly after repeated events.
