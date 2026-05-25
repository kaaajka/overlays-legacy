# OBS QA Checklist 2026

Use this checklist before treating an overlay deployment as production-ready.

Overlay URLs should not be shown publicly.

## Environment

- [ ] Production URL points to the intended Vercel/Netlify deployment.
- [ ] `VITE_WS_URL` points to the intended legacy backend WebSocket endpoint.
- [ ] `?test=true` is used only for runtime test mode, not as a production overlay URL.
- [ ] `VITE_DEBUG_LOGS=false` for production.

## OBS Browser Source setup

- [ ] Browser Source uses the correct explicit overlay URL.
- [ ] Browser Source size is tested at 1920x1080.
- [ ] Transparent background works.
- [ ] Custom CSS in OBS is disabled unless intentionally needed.
- [ ] Refresh browser when scene becomes active is tested.
- [ ] Shutdown source when not visible is tested.
- [ ] Audio monitoring/routing is tested.

## Active routes

- [ ] `/` renders the Home/link generator.
- [ ] `/ALERTS/:uuid` loads without runtime errors.
- [ ] `/TIP_ALERT/:uuid` loads without runtime errors.
- [ ] `/REWARD_ALERT/:uuid` loads without runtime errors.
- [ ] `/SUB_GOAL/:uuid` loads without runtime errors.
- [ ] `/FOLLOW_GOAL/:uuid` loads without runtime errors.
- [ ] `/QUEUE/:uuid` loads without runtime errors.
- [ ] `/ALERTS/:uuid?test=true` enables runtime test mode.
- [ ] Removed `/channel/*` routes render `Overlay not found`.
- [ ] Removed `/test/channel/*` routes render `Overlay not found`.
- [ ] Invalid route does not affect valid overlay routes.

## WebSocket behavior

- [ ] Main overlay connects to `VITE_WS_URL?account=:uuid`.
- [ ] Subs overlay connects to `VITE_WS_URL/subs?account=:uuid`.
- [ ] Followers overlay connects to `VITE_WS_URL/followers?account=:uuid`.
- [ ] Queue overlay connects to `VITE_WS_URL/queue?account=:uuid`.
- [ ] Test-mode main overlay connects to `VITE_WS_URL?account=:uuid&test=true`.
- [ ] Test-mode subs overlay connects to `VITE_WS_URL/subs?account=:uuid&test=true`.
- [ ] Test-mode followers overlay connects to `VITE_WS_URL/followers?account=:uuid&test=true`.
- [ ] Test-mode queue overlay connects to `VITE_WS_URL/queue?account=:uuid&test=true`.
- [ ] Existing legacy backend works even if it ignores `test=true`.
- [ ] Backend restart triggers reconnect.
- [ ] Short network interruption triggers reconnect.
- [ ] Duplicate event does not duplicate visible queue item unexpectedly.
- [ ] Invalid JSON payload is ignored and does not crash the overlay.

## Main overlay events

- [ ] Normal mode handles `prepare/started/update/finished`.
- [ ] Normal mode handles `alertList` where relevant.
- [ ] Normal mode ignores `test/t_prepare/t_started/t_update/t_finished`.
- [ ] Runtime test mode handles `test/t_prepare/t_started/t_update/t_finished`.
- [ ] Runtime test mode ignores `prepare/started/update/finished/alertList`.
- [ ] Donate with short message renders and finishes.
- [ ] Donate with long message renders acceptably.
- [ ] Donate without TTS does not hang.
- [ ] Donate with TTS plays in expected order.
- [ ] `alertList set/add/delete` works in normal mode.
- [ ] `acceptAlert` is sent for queued donate alerts.
- [ ] `playSound` plays sound once.
- [ ] Roulette `prepare/started/update/finished` works in normal mode.
- [ ] Coinflip `prepare/started/update/finished` works in normal mode.
- [ ] Normal event `prepare/started/update/finished` works in normal mode.

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
