# Professionalization Checklist 2026

This repo is a legacy OBS overlay frontend. The old backend remains unchanged, so frontend improvements must preserve the legacy WebSocket protocol and existing OBS routes.

## Completed in this package

- [x] Removed unused `Donate11` template.
- [x] Removed `gsap` dependency by removing the only GSAP-based donate template.
- [x] Removed unused `html-react-parser` dependency and stale commented import.
- [x] Removed unused `react-audio-player` dependency.
- [x] Added legacy WebSocket protocol documentation.
- [x] Added OBS QA checklist.
- [x] Added manual event verification matrix.
- [x] Added legacy payload fixtures.
- [x] Added safe JSON parsing helper.
- [x] Added minimal legacy protocol type guards.
- [x] Hardened main/goal/queue WebSocket message parsing without changing backend payloads.

## Do not change without a separate PR

- [ ] Do not remove `/channel/:uuid` routes.
- [ ] Do not replace `?account=:uuid` while the legacy backend is still used.
- [ ] Do not remove `t_prepare`, `t_started`, `t_update`, `t_finished` support.
- [ ] Do not replace React Router until routes are covered by fixtures and manual QA.
- [ ] Do not upgrade React/MobX in the same PR as protocol hardening.

## Next recommended PRs

### 1. Extract legacy socket helper

Goal: remove duplicated open/error/close/reconnect code from four components without changing behavior.

Suggested branch:

```bash
git checkout -b extract-legacy-overlay-socket-helper
```

### 2. Add dev replay harness

Goal: replay `src/dev/fixtures/*.json` without the backend.

Suggested branch:

```bash
git checkout -b add-overlay-fixture-replay
```

### 3. Replace React Router later, not now

React Router v5 is heavier than needed for four static OBS routes, but it works. Replace it only after route behavior is documented and verified.

Suggested future parser:

```ts
type OverlayRoute =
  | { type: 'main'; accountId: string }
  | { type: 'subs'; accountId: string }
  | { type: 'followers'; accountId: string }
  | { type: 'queue'; accountId: string }
  | { type: 'not-found' };
```

### 4. Improve audio handling

Goal: centralize `new Audio(...)`, handle rejected `play()`, prevent accidental overlapping where unwanted and document OBS audio routing.

### 5. Add automated smoke tests

Goal: minimal Vitest tests for protocol guards and route parser/replay logic once added.
