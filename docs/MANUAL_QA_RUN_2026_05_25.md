# Manual QA Run 2026-05-25

Use this document to record one manual QA pass for the current `overlays-legacy` explicit route contract.

Do not paste public stream URLs or real private account UUIDs into this file.

## Environment

- QA date: 2026-05-25
- Tester:
- Frontend target:
- Backend target:
- Browser and version:
- OBS version:
- Test account UUID stored privately:
- Notes:

## Commit SHA

- Commit SHA:
- Branch:
- Working tree clean before QA:
- Validation commands:
  - [ ] `pnpm lint`
  - [ ] `pnpm typecheck`
  - [ ] `pnpm test`
  - [ ] `pnpm build`

## Browser QA

### Home

- [ ] `/` renders the Home/link generator.
- [ ] Empty UUID input does not generate usable overlay URLs.
- [ ] Valid UUID input generates normal and `?test=true` links for all explicit routes.

### Explicit routes

- [ ] `/ALERTS/:uuid` loads.
- [ ] `/TIP_ALERT/:uuid` loads.
- [ ] `/REWARD_ALERT/:uuid` loads.
- [ ] `/SUB_GOAL/:uuid` loads.
- [ ] `/FOLLOW_GOAL/:uuid` loads.
- [ ] `/QUEUE/:uuid` loads.

### Removed routes

- [ ] `/channel/:uuid` renders `Overlay not found`.
- [ ] `/channel/:uuid/subs` renders `Overlay not found`.
- [ ] `/channel/:uuid/followers` renders `Overlay not found`.
- [ ] `/channel/:uuid/queue` renders `Overlay not found`.
- [ ] `/test/channel/:uuid` renders `Overlay not found`.
- [ ] `/test/channel/:uuid/subs` renders `Overlay not found`.
- [ ] `/test/channel/:uuid/followers` renders `Overlay not found`.
- [ ] `/test/channel/:uuid/queue` renders `Overlay not found`.
- [ ] Removed routes do not open legacy WebSocket connections.

## Fixture QA

- [ ] `/ALERTS/:uuid?fixture=main-donate-prepare&muteAudio=true` shows donation.
- [ ] `/TIP_ALERT/:uuid?fixture=main-donate-prepare&muteAudio=true` shows donation.
- [ ] `/REWARD_ALERT/:uuid?fixture=main-donate-prepare&muteAudio=true` ignores donation.
- [ ] `/ALERTS/:uuid?fixture=main-roulette-started&muteAudio=true` shows roulette.
- [ ] `/REWARD_ALERT/:uuid?fixture=main-roulette-started&muteAudio=true` shows roulette.
- [ ] `/ALERTS/:uuid?fixture=main-coinflip-started&muteAudio=true` shows coinflip.
- [ ] `/REWARD_ALERT/:uuid?fixture=main-coinflip-started&muteAudio=true` shows coinflip.
- [ ] `/SUB_GOAL/:uuid?fixture=subs-set` shows subscriber goal.
- [ ] `/FOLLOW_GOAL/:uuid?fixture=followers-set` shows follower goal.
- [ ] `/QUEUE/:uuid?fixture=queue-set` shows queue.
- [ ] Fixture replay does not open the legacy backend WebSocket.
- [ ] Muted fixture replay has no browser autoplay error spam.

## OBS QA

- [ ] Browser Source width is `1920`.
- [ ] Browser Source height is `1080`.
- [ ] Transparent background works.
- [ ] Source URL uses an explicit overlay route, not `/channel/*`.
- [ ] Test scene uses `?test=true` only when intentionally validating test mode.
- [ ] Production scene does not use `?test=true`.
- [ ] Refreshing the OBS source does not duplicate events.
- [ ] Hiding and showing the OBS source does not break reconnect.
- [ ] Restarting the backend does not require recreating the OBS source.
- [ ] Donation visual and audio sequence are correct.
- [ ] Reward, roulette, and coinflip visuals are correct.
- [ ] Subscriber goal, follower goal, and queue visuals are correct.

## Test mode QA

- [ ] `/ALERTS/:uuid?test=true` loads and appends `test=true` to the main WebSocket URL.
- [ ] `/TIP_ALERT/:uuid?test=true` loads and appends `test=true` to the main WebSocket URL.
- [ ] `/REWARD_ALERT/:uuid?test=true` loads and appends `test=true` to the main WebSocket URL.
- [ ] `/SUB_GOAL/:uuid?test=true` loads and appends `test=true` to the subs WebSocket URL.
- [ ] `/FOLLOW_GOAL/:uuid?test=true` loads and appends `test=true` to the followers WebSocket URL.
- [ ] `/QUEUE/:uuid?test=true` loads and appends `test=true` to the queue WebSocket URL.
- [ ] `?test=false` does not enable runtime test mode.
- [ ] Missing `test` query parameter does not enable runtime test mode.
- [ ] Test mode accepts test-shaped event names.
- [ ] Test mode ignores normal event names.
- [ ] Normal mode ignores test-shaped event names.

## Known issues

- Issue:
  - Severity:
  - Route or fixture:
  - Browser/OBS:
  - Steps to reproduce:
  - Expected:
  - Actual:
  - Evidence:
  - Owner:

## Final sign-off

- [ ] Browser QA passed.
- [ ] Fixture QA passed.
- [ ] OBS QA passed.
- [ ] Test mode QA passed.
- [ ] Known issues are documented and accepted.
- [ ] No source code was changed during this QA documentation update.
- [ ] `package.json` was not changed.

Sign-off:

- Tester:
- Date:
- Decision:
