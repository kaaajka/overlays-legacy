# Legacy Frontend Stabilization Policy 2026

## Status

`overlays-legacy` is a stabilized legacy OBS frontend.

It exists to keep the current OBS overlays working reliably while the future overlay platform is designed and built elsewhere. This repository is not the target future overlay platform and must not be treated as a rewrite playground.

## Primary goal

The goal is to preserve existing visual behavior and runtime behavior.

Every change should reduce risk, improve stability, document existing behavior, or add regression coverage. A change that makes the code look newer but increases runtime or visual risk is the wrong change.

## Non-goals

Do not use this repository to modernize the stack for its own sake.

Specifically:

- Do not rewrite the project to React 19.
- Do not convert class components to hooks unless required by a real bug.
- Do not replace MobX.
- Do not redesign donation, reward, or goal visuals.
- Do not change the WebSocket protocol unless required by a documented backend contract change.
- Do not change OBS routes unless required by a documented compatibility fix.
- Do not change asset paths unless a real broken path is proven.

## Allowed work

Allowed changes are small, concrete, and verifiable:

- runtime and deployment config alignment,
- TypeScript fixes that do not change behavior,
- lifecycle cleanup for real leaks or unmount bugs,
- defensive parsing around legacy payloads,
- regression tests for existing behavior,
- documentation of current contracts,
- OBS/manual QA checklists,
- fixture replay tooling that preserves existing behavior.

## Required validation

Every code or config change must pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Documentation-only changes may use a reduced validation set, but `pnpm typecheck` should still be run when the local environment is available.

## Visual and runtime QA

Each visual or runtime behavior change must be checked with OBS/manual fixture replay.

At minimum, verify the affected overlay route with representative legacy payloads and confirm:

- no visual redesign occurred,
- animation timing still feels the same,
- audio behavior did not regress,
- canvas rendering still works,
- reconnect behavior did not regress,
- existing OBS browser source URLs remain compatible.

## Backend contract changes

The WebSocket protocol may only change when there is a documented backend contract change.

When that happens, update the relevant protocol documentation, tests, and manual replay fixtures in the same change set. Silent protocol drift is not allowed.

## Review standard

A good legacy stabilization change is boring:

- minimal diff,
- narrow scope,
- clear reason,
- testable result,
- no surprise visual changes,
- no opportunistic rewrite.

A clever cleanup that changes behavior without proof is a bad change.
