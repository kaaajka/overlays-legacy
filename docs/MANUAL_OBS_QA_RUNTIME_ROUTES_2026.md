# Manual OBS QA: Runtime Overlay Routes 2026

Use this checklist after changes to explicit overlay routes, runtime `?test=true` mode, WebSocket URL generation, or OBS deployment configuration.

Overlay URLs should not be shown publicly.

## Test data

Before testing, choose one real development account UUID and keep it private.

- [ ] Test account UUID is available.
- [ ] Test backend is running.
- [ ] Frontend dev server or deployed preview is running.
- [ ] OBS test scene is separate from production scenes.
- [ ] Browser console is open during browser checks.
- [ ] OBS logs are available during OBS checks.

## Browser checks

### Home generator

- [ ] `/` renders the Home/link generator.
- [ ] Generator starts without a hardcoded UUID.
- [ ] UUID input placeholder is `Enter account UUID`.
- [ ] Empty input does not generate usable private overlay URLs.
- [ ] Filled input generates normal and test links for `ALERTS`.
- [ ] Filled input generates normal and test links for `TIP_ALERT`.
- [ ] Filled input generates normal and test links for `REWARD_ALERT`.
- [ ] Filled input generates normal and test links for `SUB_GOAL`.
- [ ] Filled input generates normal and test links for `FOLLOW_GOAL`.
- [ ] Filled input generates normal and test links for `QUEUE`.
- [ ] Generated links use the current origin and base path.
- [ ] Page shows the warning that overlay URLs should not be shown publicly.

### Removed legacy routes

- [ ] `/channel/:uuid` is rejected.
- [ ] `/channel/:uuid/subs` is rejected.
- [ ] `/channel/:uuid/followers` is rejected.
- [ ] `/channel/:uuid/queue` is rejected.
- [ ] `/test/channel/:uuid` is rejected.
- [ ] `/test/channel/:uuid/subs` is rejected.
- [ ] `/test/channel/:uuid/followers` is rejected.
- [ ] `/test/channel/:uuid/queue` is rejected.
- [ ] Rejected routes render the expected not-found state and do not open legacy WebSocket connections.

### Explicit overlay routes

- [ ] `/ALERTS/:uuid` loads.
- [ ] `/ALERTS/:uuid?test=true` loads.
- [ ] `/TIP_ALERT/:uuid` loads.
- [ ] `/TIP_ALERT/:uuid?test=true` loads.
- [ ] `/REWARD_ALERT/:uuid` loads.
- [ ] `/REWARD_ALERT/:uuid?test=true` loads.
- [ ] `/SUB_GOAL/:uuid` loads.
- [ ] `/SUB_GOAL/:uuid?test=true` loads.
- [ ] `/FOLLOW_GOAL/:uuid` loads.
- [ ] `/FOLLOW_GOAL/:uuid?test=true` loads.
- [ ] `/QUEUE/:uuid` loads.
- [ ] `/QUEUE/:uuid?test=true` loads.
- [ ] `?test=false` does not enable runtime test mode.
- [ ] Other query parameters do not enable runtime test mode.
- [ ] Invalid UUIDs are rejected.

## Event filtering checks

### Normal mode

- [ ] Normal mode accepts `prepare`.
- [ ] Normal mode accepts `started`.
- [ ] Normal mode accepts `update`.
- [ ] Normal mode accepts `finished`.
- [ ] Normal mode accepts `alertList` where relevant.
- [ ] Normal mode ignores `test`.
- [ ] Normal mode ignores `t_prepare`.
- [ ] Normal mode ignores `t_started`.
- [ ] Normal mode ignores `t_update`.
- [ ] Normal mode ignores `t_finished`.

### Runtime test mode

- [ ] Test mode accepts `test`.
- [ ] Test mode accepts `t_prepare`.
- [ ] Test mode accepts `t_started`.
- [ ] Test mode accepts `t_update`.
- [ ] Test mode accepts `t_finished`.
- [ ] Test mode ignores `prepare`.
- [ ] Test mode ignores `started`.
- [ ] Test mode ignores `update`.
- [ ] Test mode ignores `finished`.
- [ ] Test mode ignores `alertList`.

### Overlay type filtering

- [ ] `ALERTS` receives all allowed normal alert categories in normal mode.
- [ ] `ALERTS?test=true` receives all allowed test alert categories in test mode.
- [ ] `TIP_ALERT` receives donations/tips only.
- [ ] `TIP_ALERT?test=true` receives test donations/tips only.
- [ ] `REWARD_ALERT` receives Twitch rewards only.
- [ ] `REWARD_ALERT?test=true` receives test Twitch rewards only.
- [ ] Donation events do not render in `REWARD_ALERT`.
- [ ] Reward events do not render in `TIP_ALERT`.

## WebSocket URL checks

- [ ] `/ALERTS/:uuid` connects to `/ws?account=:uuid`.
- [ ] `/TIP_ALERT/:uuid` connects to `/ws?account=:uuid`.
- [ ] `/REWARD_ALERT/:uuid` connects to `/ws?account=:uuid`.
- [ ] `/SUB_GOAL/:uuid` connects to `/ws/subs?account=:uuid`.
- [ ] `/FOLLOW_GOAL/:uuid` connects to `/ws/followers?account=:uuid`.
- [ ] `/QUEUE/:uuid` connects to `/ws/queue?account=:uuid`.
- [ ] Test mode appends `&test=true` to the matching WebSocket URL.
- [ ] Existing legacy backend works even if it ignores the `test=true` query parameter.

## OBS checks

### Browser Source setup

- [ ] Browser Source width is `1920`.
- [ ] Browser Source height is `1080`.
- [ ] Transparent background is enabled/working.
- [ ] Audio is enabled or controlled by OBS according to the scene design.
- [ ] Custom CSS is empty unless intentionally needed.
- [ ] Source URL uses an explicit overlay route, not `/channel/*`.
- [ ] Source URL uses `?test=true` only for test scenes.
- [ ] Production scene does not use `?test=true`.
- [ ] Overlay URLs are not shown publicly on stream, screenshots, chat, or docs.

### Reconnect and refresh

- [ ] Refresh source does not break WebSocket reconnect.
- [ ] Hiding and showing the source does not break reconnect.
- [ ] Restarting the backend does not require recreating the OBS source.
- [ ] Short network interruption does not leave the overlay permanently disconnected.

### Visual and audio behavior

- [ ] Donation visual appears with template audio.
- [ ] Donation visual appears when template audio fails.
- [ ] Donation visual does not render twice after template audio failure.
- [ ] Donation template selection remains correct.
- [ ] Donation audio order remains: template sound, TTS nickname, TTS amount, TTS message.
- [ ] Donation sequence ends after TTS and legacy delay.
- [ ] Cancelled/replaced donation sequence does not finish stale visual state.
- [ ] Reward alert appears.
- [ ] Roulette appears.
- [ ] Coinflip appears.
- [ ] Subscription goal appears.
- [ ] Follower goal appears.
- [ ] Queue appears.

## Regression checks

- [ ] No `build:test` usage in package scripts or deployment instructions.
- [ ] No `/test/channel` usage in active docs, OBS sources, fixture replay notes, or deployment notes.
- [ ] No `/channel` usage in active docs, OBS sources, fixture replay notes, or deployment notes.
- [ ] No hardcoded real UUID in committed source, docs, fixtures, or screenshots.
- [ ] Source ZIP does not require `node_modules`.
- [ ] Source ZIP does not require `dist`.
- [ ] Source ZIP contains source files, public assets, docs, package files, and lockfile only.
- [ ] No unrelated source code changes are included with this QA documentation update.

## Final sign-off

- [ ] Browser route QA passed.
- [ ] Event filtering QA passed.
- [ ] OBS Browser Source QA passed.
- [ ] Regression checks passed.
- [ ] `pnpm typecheck` passed locally.
