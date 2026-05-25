# OBS Overlay QA Matrix 2026

## 1. Purpose

This document is the manual QA checklist for validating the `overlays-legacy` OBS/browser-source frontend.

Use it after changes to:

- routing and route aliases,
- legacy WebSocket protocol handling,
- socket lifecycle/reconnect behavior,
- fixture replay,
- audio preview behavior,
- visual overlay markup/styles,
- backend/frontend contract assumptions.

This is a QA matrix for the legacy overlay frontend. It does not redesign the backend protocol and does not imply new backend WebSocket endpoints.

## 2. Standard validation commands

Run these before manual OBS/browser-source QA:

```bash
pnpm test
pnpm run build
pnpm run typecheck
pnpm run lint
```

Expected result:

- tests pass,
- production build succeeds,
- TypeScript passes,
- Biome lint passes cleanly.

## 3. Main overlay route matrix

Use a known valid UUID for `:uuid`, for example:

```txt
94bdf886-1c70-11eb-adc1-0242ac120011
```

For fixture replay, append:

```txt
?fixture=<fixture-name>&muteAudio=true
```

The `muteAudio=true` mode skips actual audio while preserving preview timing. Use it for fast visual validation without browser autoplay noise. `/ALERTS/:uuid` is the all-events main overlay URL. Removed historical `/channel/*` routes should be checked only as rejection cases.

| Route | Fixture | Expected behavior |
|---|---|---|
| `/ALERTS/:uuid` | `main-donate-prepare` | Shows donate. Recommended all-events route runs main overlay mode `all`. |
| `/ALERTS/:uuid?test=true` | test donate event | Shows donate only for test-shaped event names. |
| `/TIP_ALERT/:uuid` | `main-donate-prepare` | Shows donate. Tip route runs main overlay mode `tip`. |
| `/REWARD_ALERT/:uuid` | `main-donate-prepare` | Ignores donate. Reward route filters out `key === "donate"`. |
| `/ALERTS/:uuid` | `main-roulette-started` | Shows roulette. Recommended all-events route runs main overlay mode `all`. |
| `/ALERTS/:uuid?test=true` | test roulette event | Shows roulette only for test-shaped event names. |
| `/TIP_ALERT/:uuid` | `main-roulette-started` | Ignores roulette. Tip route only accepts donate events. |
| `/REWARD_ALERT/:uuid` | `main-roulette-started` | Shows roulette. Reward route accepts reward-like `roulette` key. |
| `/ALERTS/:uuid` | `main-coinflip-started` | Shows coinflip. Recommended all-events route runs main overlay mode `all`. |
| `/ALERTS/:uuid?test=true` | test coinflip event | Shows coinflip only for test-shaped event names. |
| `/TIP_ALERT/:uuid` | `main-coinflip-started` | Ignores coinflip. Tip route only accepts donate events. |
| `/REWARD_ALERT/:uuid` | `main-coinflip-started` | Shows coinflip. Reward route accepts reward-like `coinflip` key. |

Concrete URLs:

```txt
/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&muteAudio=true
/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?test=true&fixture=main-donate-prepare&muteAudio=true
/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&muteAudio=true
/REWARD_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&muteAudio=true

/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-roulette-started&muteAudio=true
/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?test=true&fixture=main-roulette-started&muteAudio=true
/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-roulette-started&muteAudio=true
/REWARD_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-roulette-started&muteAudio=true

/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-coinflip-started&muteAudio=true
/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?test=true&fixture=main-coinflip-started&muteAudio=true
/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-coinflip-started&muteAudio=true
/REWARD_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-coinflip-started&muteAudio=true
```

## 4. Goal overlays matrix

| Route | Fixture | Expected behavior |
|---|---|---|
| `/SUB_GOAL/:uuid` | `subs-set` | Shows/updates subscriber goal state from the legacy subs goal payload. |
| `/FOLLOW_GOAL/:uuid` | `followers-set` | Shows/updates follower goal state from the legacy followers goal payload. |
| `/QUEUE/:uuid` | `queue-set` | Shows/updates queue state from the legacy queue payload. |

Concrete URLs:

```txt
/SUB_GOAL/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=subs-set
/FOLLOW_GOAL/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=followers-set
/QUEUE/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=queue-set
```

## 5. Audio fixture modes

### Real audio preview

```txt
/TIP_ALERT/:uuid?fixture=main-donate-prepare
```

Expected:

- fixture does not auto-start immediately in normal browser dev preview,
- a dev-only button appears: `Click to start fixture preview with audio`,
- after click, fixture replay starts,
- audio/TTS attempts happen after a user gesture,
- this avoids normal browser autoplay blocking for real audio preview.

### Muted preview with preserved timing

```txt
/TIP_ALERT/:uuid?fixture=main-donate-prepare&muteAudio=true
```

Expected:

- fixture starts immediately,
- audio playback is skipped,
- no `NotAllowedError` noise from browser autoplay policy,
- donate timing is still simulated so the animation does not disappear instantly.

### Fast muted logic preview

```txt
/TIP_ALERT/:uuid?fixture=main-donate-prepare&muteAudio=true&fast=true
```

Expected:

- fixture starts immediately,
- audio playback is skipped,
- simulated audio delay is skipped,
- useful for quickly validating event/filter logic rather than visual timing.

## 6. Error/invalid URL checks

### Invalid route syntax

Check:

```txt
/TIP_ALERT/not-a-uuid
/REWARD_ALERT/not-a-uuid
/QUEUE/not-a-uuid
/REWARD_ALERT/
```

Expected:

```txt
Overlay not found
Invalid or unsupported overlay URL
```

### Valid UUID format but unavailable backend account

Example:

```txt
/QUEUE/94bdf886-1c70-11eb-adc1-0242ac220011
```

Expected:

- route parses because UUID syntax is valid,
- WebSocket may retry a few times,
- after repeated failures, overlay shows:

```txt
Overlay unavailable
Could not connect to this overlay. Check widget URL or backend status.
```

- reconnect spam stops or slows down significantly,
- this is a connection/account problem, not a route syntax problem.

## 7. OBS/browser-source checks

For each route touched by a change, validate in browser dev preview and, when relevant, OBS Browser Source.

Checklist:

- Browser Source refresh does not duplicate events, timers, reactions or socket connections.
- Overlay remains visually positioned as expected at common canvas sizes, especially `1920x1080` and `1280x720`.
- Transparent background behaves as expected for OBS composition.
- Audio behavior is correct:
  - real audio requires browser click in dev fixture preview,
  - muted fixture replay does not call `audio.play()`,
  - failed remote TTS/audio logs safely and does not crash the overlay.
- Invalid account URLs do not reconnect forever with aggressive console/network spam.
- Muted fixture replay does not produce console error spam.
- Fixture replay does not open the legacy backend WebSocket.
- Normal non-fixture routes still open the legacy backend WebSocket using the existing contract.

## 8. Acceptance criteria

A change is acceptable when:

- `pnpm test` passes,
- `pnpm run build` passes,
- `pnpm run typecheck` passes,
- `pnpm run lint` passes,
- expected routes from this matrix behave correctly,
- fixture replay behavior is unchanged unless the task explicitly changes fixture behavior,
- no unexpected visual regressions are observed,
- no unexpected audio promise errors or MobX strict-mode warnings appear,
- docs are updated if backend/frontend contract assumptions change.

If a future change modifies backend payload shape, route meaning, fixture semantics, or overlay mode filtering, update this QA matrix together with `BACKEND_CONTRACT_SNAPSHOT_2026.md` and `OVERLAY_PROTOCOL.md`.


## Runtime asset path checks

During visual QA, confirm that moved runtime assets load from the finalized public structure:

- donation media from `/assets/donations/audio/` and `/assets/donations/gif/`;
- reward images from `/assets/images/rewards/`;
- reward random sounds from `/assets/sounds/rewards/random/`;
- coinflip prepare sounds from `/assets/sounds/rewards/coinflip/`;
- shared event sounds from `/assets/sounds/shared/`;
- coinflip images from `/assets/images/coinflip/`.

There should be no runtime requests to `seeklogo.com` or `kajkowo.bdrewnowski.ovh`.


## Historical removed-route rejection checks

```txt
/channel/94bdf886-1c70-11eb-adc1-0242ac120011
/channel/94bdf886-1c70-11eb-adc1-0242ac120011/subs
/channel/94bdf886-1c70-11eb-adc1-0242ac120011/followers
/channel/94bdf886-1c70-11eb-adc1-0242ac120011/queue
/test/channel/94bdf886-1c70-11eb-adc1-0242ac120011
```
