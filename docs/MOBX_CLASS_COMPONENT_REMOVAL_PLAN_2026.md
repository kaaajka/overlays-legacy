# MobX and class component removal plan 2026

Status: planning document only. Do not remove MobX in the current stabilized OBS bridge milestone.

This repository is currently a legacy OBS overlay bridge that has been stabilized around explicit overlay routes, runtime `?test=true` mode, defensive WebSocket parsing, and manual OBS QA. Removing MobX and class components is a valid future cleanup, but doing it as one large rewrite now would be reckless. The current priority is to preserve stream-visible behavior.

## 1. Current inventory

### Class components

Current React class components in `src/components`:

| File | Component | Primary responsibility | Migration risk |
|---|---|---:|---:|
| `src/components/PageChannel.tsx` | `PageChannel` | Main alerts bridge, WebSocket lifecycle, donation queue, rewards, roulette, coinflip, audio side effects | Very high |
| `src/components/DonateEvent.tsx` | `DonateEvent` | Donation visual sequence, template sound, TTS order, cancellation, finish callback | Very high |
| `src/components/RouletteEvent.tsx` | `RouletteEvent` | Roulette animation lifecycle and winner reaction | High |
| `src/components/CoinflipEvent.tsx` | `CoinflipEvent` | Coinflip animation lifecycle and winner reaction | High |
| `src/components/Goal.tsx` | `Goal` | Canvas drawing for sub/follow goals, resize handling, MobX reactions over props | High |
| `src/components/PageChannelSubs.tsx` | `PageChannelSubs` | Sub goal WebSocket bridge and goal state | Medium |
| `src/components/PageChannelFollowers.tsx` | `PageChannelFollowers` | Follower goal WebSocket bridge and goal state | Medium |
| `src/components/PageChannelQueue.tsx` | `PageChannelQueue` | Queue WebSocket bridge and queue rendering | Medium |

`NormalEvent` is already a function component, but it is still wrapped in `observer`.

### Observer components

Current `mobx-react` observer usage:

| File | Usage |
|---|---|
| `src/components/PageChannel.tsx` | `@observer` |
| `src/components/DonateEvent.tsx` | `@observer` |
| `src/components/RouletteEvent.tsx` | `@observer` |
| `src/components/CoinflipEvent.tsx` | `@observer` |
| `src/components/Goal.tsx` | `@observer` |
| `src/components/PageChannelSubs.tsx` | `@observer` |
| `src/components/PageChannelFollowers.tsx` | `@observer` |
| `src/components/PageChannelQueue.tsx` | `@observer` |
| `src/components/NormalEvent.tsx` | `observer(NormalEvent)` |

### MobX usage points

Current MobX API usage found in source:

| API | Current usage |
|---|---|
| `observable` | Component instance fields and event model fields |
| `action` | Component setter methods and model mutation methods |
| `action.bound` | `PageChannel.donateFinished` |
| `reaction` | Account key reconnect, goal redraw triggers, roulette winner trigger, coinflip winner trigger |
| `runInAction` | WebSocket callbacks and roulette finish state updates |
| `makeObservable` | Class components and MobX model classes |
| `computed` | `NormalEventModel.formattedTime` |

Files importing from `mobx`:

| File | Usage summary |
|---|---|
| `src/components/PageChannel.tsx` | `observable`, `action`, `reaction`, `makeObservable` |
| `src/components/PageChannelSubs.tsx` | `observable`, `action`, `runInAction`, `makeObservable` |
| `src/components/PageChannelFollowers.tsx` | `observable`, `action`, `runInAction`, `makeObservable` |
| `src/components/PageChannelQueue.tsx` | `observable`, `action`, `runInAction`, `makeObservable` |
| `src/components/Goal.tsx` | `observable`, `reaction`, `makeObservable` |
| `src/components/RouletteEvent.tsx` | `observable`, `action`, `reaction`, `runInAction`, `makeObservable` |
| `src/components/CoinflipEvent.tsx` | `observable`, `action`, `reaction`, `makeObservable` |
| `src/models/Event.tsx` | `observable`, `action`, `makeObservable` |
| `src/models/NormalEvent.tsx` | `observable`, `computed`, `makeObservable` |
| `src/models/RouletteEvent.tsx` | `observable`, `action`, `makeObservable` |
| `src/models/CoinflipEvent.tsx` | `observable`, `action`, `makeObservable` |

Files importing from `mobx-react`:

| File |
|---|
| `src/components/PageChannel.tsx` |
| `src/components/PageChannelSubs.tsx` |
| `src/components/PageChannelFollowers.tsx` |
| `src/components/PageChannelQueue.tsx` |
| `src/components/Goal.tsx` |
| `src/components/DonateEvent.tsx` |
| `src/components/RouletteEvent.tsx` |
| `src/components/CoinflipEvent.tsx` |
| `src/components/NormalEvent.tsx` |

### Model classes using MobX

| File | Model | MobX dependency | Notes |
|---|---|---|---|
| `src/models/Event.tsx` | `EventModel` | `state` observable, `update` action | Base mutable event model for normal/reward/roulette/coinflip flow |
| `src/models/NormalEvent.tsx` | `NormalEventModel` | `time` observable, `formattedTime` computed | Used by normal reward alerts and countdown-like updates |
| `src/models/RouletteEvent.tsx` | `RouletteEventModel` | `winner` observable, `setWinner` action | Winner drives roulette component reaction |
| `src/models/CoinflipEvent.tsx` | `CoinflipEventModel` | `winner`, `coin_landing_side`, `coin_chosen_side` observables and actions | Drives coinflip component reaction |

Model classes not currently using MobX:

| File | Model |
|---|---|
| `src/models/DonateEvent.tsx` | `DonateEventModel` |
| `src/models/QueueEvent.tsx` | `QueueEventModel` |
| `src/models/RouletteItem.tsx` | `RouletteItemModel` |
| `src/models/CoinflipSegment.tsx` | `CoinflipSegmentModel` |

## 2. Risk assessment

### Donation queue

Risk level: very high.

`PageChannel` owns `donateList`, `currentDonate`, donation queue mutation, and the `donateFinished` callback chain. `DonateEvent` owns the sequence timing, audio/TTS order, timeout cancellation, and visual rendering moment. A naive rewrite can easily cause duplicate donations, skipped donations, alerts that never finish, or alerts that finish before TTS/delay completes.

Required protection before conversion:

- Tests for push/replace/finish donation queue transitions.
- Tests for stale sequence cancellation.
- Tests for template audio success, failure, timeout, and `play()` rejection.
- Manual OBS QA for visual timing and audio order.

### Reward state

Risk level: high.

Rewards are represented by `NormalEventModel`, `EventModel.update`, `currentEvent`, and audio side effects in `PageChannel`. The update protocol uses dynamic payload merging. Removing MobX before extracting typed transition helpers could break countdown/time rendering, current alert clearing, or reward-only filtering.

Required protection before conversion:

- Test normal `prepare` → `started` → `update` → `finished` flow.
- Test `ALERTS`, `TIP_ALERT`, and `REWARD_ALERT` filtering.
- Test `alertList` behavior where relevant.

### Roulette lifecycle

Risk level: high.

`RouletteEvent` uses a MobX `reaction` to react to `event.winner`. It also sets local `finished` state and has timing-sensitive animation behavior. If converted too early, the winner animation can stop firing, fire twice, or race with unmount.

Required protection before conversion:

- Extract pure winner selection/state transition tests first.
- Test winner update after started event.
- Manual OBS QA for animation start, winner landing, and cleanup.

### Coinflip lifecycle

Risk level: high.

`CoinflipEvent` uses a MobX `reaction` around winner-related event fields and local hide/show state. It is similar to roulette but has segment image and side-state behavior. A rewrite can easily desync selected side, landing side, and visual result.

Required protection before conversion:

- Tests for started/update payloads that set chosen side, landing side, and winner.
- Manual OBS QA for both sides and final result.

### Goal canvas reactions

Risk level: high.

`Goal` combines canvas drawing, image loading, resize throttling, saved pixel data, and MobX reactions over props. This is not a normal React render-only component. If converted badly, it can draw after unmount, fail to redraw on goal/current updates, leak resize handlers, or lose the existing visual geometry.

Required protection before conversion:

- Extract pure goal percentage calculation helper.
- Keep canvas drawing behavior untouched until props/state flow is stable.
- Manual OBS QA at 1920x1080 and during browser source refresh.

### Queue updates

Risk level: medium.

`PageChannelQueue` uses `runInAction` to mutate array state from WebSocket callbacks. The flow is simpler than alerts, but array operations must preserve legacy behavior for `set`, `add`, and `delete` events.

Required protection before conversion:

- Pure reducer tests for `set`, `add`, `delete`, duplicate add, and missing delete.
- Manual OBS QA for queue appearing, updating, and clearing after reconnect.

### WebSocket callbacks

Risk level: high.

Several components mutate observable state inside WebSocket callbacks. Hooks conversion must preserve socket connect/disconnect timing, error handling, fixture replay behavior, and account key changes. This should be moved behind explicit lifecycle helpers before components are rewritten.

Required protection before conversion:

- Tests for socket URL construction and message filtering already exist; extend with state transition tests before conversion.
- Manual reconnect/refresh QA after each converted route.

### OBS rendering timing

Risk level: very high.

This is an OBS overlay, not a regular app page. A small timing difference can be stream-visible: alert starts too early, visual appears after audio, transparent background breaks, audio fails to play, or source refresh loses state. Any migration step must preserve the current timing unless the task explicitly says otherwise.

Required protection before conversion:

- Browser QA for each route.
- OBS Browser Source QA for transparency, resolution, audio, refresh, reconnect, and visual timing.
- Fixture replay coverage for each changed flow.

## 3. Migration principles

1. No big bang rewrite.
2. Convert one component or one flow at a time.
3. Preserve visual behavior by default.
4. Preserve WebSocket protocol exactly.
5. Preserve explicit routes and runtime `?test=true` behavior.
6. Preserve donation template selection and audio/TTS order.
7. Write or expand tests before conversion.
8. Extract pure state transition helpers before converting React components.
9. Keep manual OBS QA mandatory after each converted flow.
10. Do not introduce a global state library unless a specific flow proves local state/reducer is insufficient.
11. Do not combine MobX removal with route, protocol, asset, or visual redesign work.
12. Keep each PR/commit small enough to revert safely during stream QA.

## 4. Recommended order

### Step 0 — Freeze behavior with tests and fixtures

Before removing MobX anywhere, lock down the current behavior:

- Main alert event filtering tests.
- Donation queue tests.
- Donation audio failure tests.
- Queue reducer tests.
- Goal percentage tests.
- Roulette and coinflip transition tests.
- Fixture replay examples for each route.

### Step 1 — Extract pure state transition helpers first

Create pure TypeScript helpers that do not import React or MobX. This gives safe test targets before touching components.

Suggested helpers:

| Helper | Purpose |
|---|---|
| `applyQueueEvent(state, message)` | Handles queue `set`, `add`, `delete` |
| `applyGoalEvent(state, message)` | Handles sub/follow current and goal updates |
| `applyMainAlertEvent(state, message, mode, testMode)` | Handles normal alert state transitions |
| `applyDonationQueueEvent(state, message)` | Handles donation list/current donation transitions |
| `applyRouletteEvent(state, message)` | Handles roulette start/update/winner transition |
| `applyCoinflipEvent(state, message)` | Handles coinflip start/update/winner transition |

This step should not change UI behavior.

### Step 2 — Convert `PageChannelQueue`

Convert queue first because it is the smallest state surface:

- Replace observable `queue`, `connecting`, `connectionFailed` with `useReducer` or local `useState`.
- Use the extracted `applyQueueEvent` helper.
- Preserve `buildQueueOverlaySocketUrl` and socket lifecycle behavior.
- Run browser QA and OBS QA for `/QUEUE/:uuid` and `/QUEUE/:uuid?test=true`.

### Step 3 — Convert `PageChannelSubs`

Convert subscription goal bridge:

- Replace MobX fields with local state/reducer.
- Preserve WebSocket URL and runtime testMode handling.
- Keep `Goal` unchanged in this step.
- Run browser QA and OBS QA for `/SUB_GOAL/:uuid` and `/SUB_GOAL/:uuid?test=true`.

### Step 4 — Convert `PageChannelFollowers`

Convert follower goal bridge after subs because the flow is similar:

- Reuse the same goal state transition helper if possible.
- Preserve route and socket behavior.
- Keep `Goal` unchanged in this step.
- Run browser QA and OBS QA for `/FOLLOW_GOAL/:uuid` and `/FOLLOW_GOAL/:uuid?test=true`.

### Step 5 — Convert `Goal`

Convert canvas component only after the parent goal bridges are stable:

- Replace MobX `reaction` with `useEffect` watching `current`, `goal`, and loaded image state.
- Keep canvas drawing functions as close to current code as possible.
- Preserve resize throttling and cleanup behavior.
- Preserve image asset path and visual geometry.
- Run OBS QA at 1920x1080 and verify source refresh.

### Step 6 — Convert `CoinflipEvent`

Convert coinflip before roulette if its state helper is simpler in practice:

- Replace winner `reaction` with explicit `useEffect` over winner/side fields.
- Preserve animation timing and image visibility behavior.
- Do not change coinflip assets or audio behavior.
- Run fixture replay and OBS QA.

### Step 7 — Convert `RouletteEvent`

Convert roulette after coinflip:

- Replace winner `reaction` with explicit `useEffect`.
- Preserve animation timing, winner landing, and final state.
- Do not change roulette assets or WebSocket protocol.
- Run fixture replay and OBS QA.

### Step 8 — Convert `DonateEvent`

Convert donation visual/audio component late, not early:

- It is timing-sensitive and recently stabilized.
- Preserve template sound → TTS nickname → TTS amount → TTS message → legacy delay → finish sequence.
- Preserve cancellation behavior and stale sequence guards.
- Preserve visual rendering before template audio play and safe visual rendering when template audio fails.
- Run all donation audio tests and OBS QA.

### Step 9 — Convert `PageChannel` last

Convert the main alert bridge last because it owns the most dangerous orchestration:

- Donation queue.
- Current reward/roulette/coinflip event.
- Current playing audio.
- WebSocket lifecycle.
- Runtime `testMode` filtering.
- Mode filtering for `ALERTS`, `TIP_ALERT`, `REWARD_ALERT`.

Do not touch `PageChannel` until child event components and pure transition helpers are stable.

## 5. Target architecture

### State model

Target state should be plain TypeScript data, not observable classes.

Preferred shape:

- Plain event DTOs parsed at protocol boundary.
- Pure reducers for state transitions.
- Small local React state for view-only toggles.
- Explicit lifecycle effects for sockets, timeouts, audio, image loading, and canvas.

### React model

Use hooks only after state logic is extracted:

- `useReducer` for flows with event streams: queue, goals, main alerts.
- `useState` for small local UI state: connecting, connectionFailed, local animation flags.
- `useEffect` for lifecycle: sockets, audio, timers, reactions formerly handled by MobX.
- `useRef` for mutable runtime handles: sockets, timeouts, audio instances, canvas context, stale sequence ids.

### Global state

Do not add Redux, Zustand, Jotai, or another global state library by default. This app is a set of isolated OBS route surfaces. Most state should stay route-local.

A global state library is only acceptable if a later proven requirement needs cross-route shared state. Current overlays do not require that.

### Model classes

Replace MobX model classes gradually with one of these:

- Plain interfaces plus constructors/parsers.
- Immutable state objects updated by reducers.
- Small helper functions for formatted/computed values.

Example target direction:

| Current | Target |
|---|---|
| `EventModel.update(args)` dynamic mutation | typed reducer/transition helper |
| `NormalEventModel.formattedTime` computed | `formatEventTime(time)` helper |
| `RouletteEventModel.setWinner()` | reducer event: `{ type: "rouletteWinner", winner }` |
| `CoinflipEventModel.setCoinLandingSide()` | reducer event: `{ type: "coinflipUpdate", landingSide }` |

## 6. Exit criteria

MobX/class removal milestone is complete only when all criteria are true:

- No `@observer` decorators.
- No `observer(...)` wrappers.
- No imports from `mobx`.
- No imports from `mobx-react`.
- No MobX model classes.
- No decorators in source.
- `experimentalDecorators` can be removed from `tsconfig.json`.
- `mobx` can be removed from `package.json`.
- `mobx-react` can be removed from `package.json`.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm build` passes.
- Manual browser QA passes for all explicit routes.
- Manual OBS QA passes for all overlay surfaces.
- Fixture replay still works for changed flows.
- No WebSocket protocol changes were introduced accidentally.
- No donation/audio timing regression was introduced.

## 7. Explicit current recommendation

It is too early to remove MobX in one task now.

The current code still uses MobX across alert orchestration, goal canvas redraws, roulette/coinflip reactions, queue updates, and mutable model classes. Removing all of that in one task would mix architecture work with high-risk stream-visible behavior. That is how you create a clean-looking rewrite that quietly breaks OBS during a live stream.

The correct next move is to extract and test pure state transition helpers, then migrate the smallest flows first. Keep the stabilized OBS bridge boring until every conversion step has tests and manual OBS QA behind it.

## 8. Suggested milestone structure

| Milestone | Scope | Expected commit type |
|---|---|---|
| M1 | Pure queue/goal/main alert transition helpers and tests | `test` / `refactor` |
| M2 | Convert `PageChannelQueue` | `refactor(queue)` |
| M3 | Convert `PageChannelSubs` and `PageChannelFollowers` | `refactor(goals)` |
| M4 | Convert `Goal` canvas component | `refactor(goal)` |
| M5 | Convert `CoinflipEvent` | `refactor(coinflip)` |
| M6 | Convert `RouletteEvent` | `refactor(roulette)` |
| M7 | Convert `DonateEvent` | `refactor(donations)` |
| M8 | Convert `PageChannel` | `refactor(alerts)` |
| M9 | Remove MobX packages and decorators | `chore(deps)` |

Each milestone must have its own QA note or checklist result. If a flow cannot be manually verified in OBS, it is not done.
