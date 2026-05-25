# Feature parity matrix 2026

## Purpose

This matrix compares three worlds:

1. `build.zip` original legacy frontend behavior.
2. Current `overlays-legacy` behavior.
3. Future/new `apps/overlays` target behavior from the current Kaaajka 2026 repo line.

`overlays-legacy` is a bridge. It exists to stabilize the OBS frontend that already works in production-like legacy flows. It is not the final overlay platform. Do not turn this repo into the new platform by accident. Preserve behavior here, then migrate deliberately into `apps/overlays` with explicit parity decisions.

## Status legend

| Status | Meaning |
| --- | --- |
| `PRESENT` | Behavior exists in the inspected source. |
| `PRESENT / HARDENED` | Behavior exists and has been made safer without intentional behavior changes. |
| `PARTIAL` | Some supporting behavior exists, but not full legacy parity. |
| `MISSING` | Not implemented in the inspected source. |
| `UNKNOWN / TO VERIFY` | Not enough evidence in the inspected source; verify manually before claiming parity. |
| `DO NOT MIGRATE 1:1` | Legacy behavior should not be copied as-is. Rebuild intentionally. |

## Matrix

| Feature | build.zip | overlays-legacy | new apps/overlays | Decision | Priority | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Donate templates | `PRESENT` - template config lived inside `DonateEvent`; legacy included thresholds and multiple donation components. | `PRESENT / HARDENED` - config and resolver extracted to `src/donations/*`; visuals still use legacy components. | `MISSING` - current `DonationAlert` is generic and does not implement legacy threshold template catalog. | Preserve in `overlays-legacy`; rebuild as typed template catalog in new app. | P1 | New app must not claim visual parity until thresholds, media, and components exist. |
| Donate TTS nickname | `PRESENT` - sequential TTS nickname after template sound when configured. | `PRESENT / HARDENED` - sequence runner keeps template sound then nickname TTS order. | `PARTIAL` - shared schema has possible nickname URL fields, but current component plays only a single generic `tts.url`. | Preserve legacy sequence; implement explicit nickname step in new app. | P1 | Do not collapse nickname/amount/message if parity is required. |
| Donate TTS amount | `PRESENT` - sequential amount TTS after nickname. | `PRESENT / HARDENED` - amount TTS order preserved. | `PARTIAL` - schema can carry amount URL, component does not sequence it. | Preserve in legacy; add dedicated amount step in new app. | P1 | Exact order matters: template sound -> nickname -> amount -> message. |
| Donate TTS message | `PRESENT` - sequential message TTS after amount. | `PRESENT / HARDENED` - message TTS order preserved. | `PARTIAL` - schema can carry message URL, component does not sequence it. | Preserve in legacy; add dedicated message step in new app. | P1 | Missing or empty URLs should not block the donation. |
| Donate HTML message | `PRESENT` - old frontend stripped emote images to alt text rather than rendering raw HTML. | `PRESENT` - same legacy preparation behavior is preserved in `prepareDonateMessage`. | `PRESENT` - `DonationAlert` sanitizes HTML and renders with `dangerouslySetInnerHTML`. | Do not force identical rendering unless migration spec demands it. | P2 | This is not identical behavior: old strips images to text, new sanitizes/render HTML. Verify desired product behavior. |
| Donation missing audio fallback | `PARTIAL` - missing TTS URLs were skipped; broken audio could hang or reject sequence. | `PRESENT / HARDENED` - missing URLs skipped; failed/broken audio continues; timeouts prevent hangs. | `PARTIAL` - optional sound/TTS playback catches errors, but no full legacy sequence runner. | Keep hardened legacy fallback; port non-blocking behavior to new app. | P1 | This is safety-critical for OBS queues. |
| Roulette prepare | `PRESENT` - `prepare`/`t_prepare` created roulette event and played random prepare sound. | `PRESENT` - legacy main overlay supports prepare event and random prepare sound. | `MISSING` | Preserve in bridge; rebuild as typed event before migration. | P2 | Needs fixture and backend event contract in new app. |
| Roulette started | `PRESENT` - started event used backend items/winner/time. | `PRESENT` - current protocol guards started args and renders `RouletteEvent`. | `MISSING` | Preserve; design typed roulette event for new app. | P2 | Do not recalculate backend roulette results in frontend. |
| Coinflip prepare | `PRESENT` - prepare event created coinflip event and played coinflip prepare sound. | `PRESENT` - current main overlay supports coinflip prepare and sound selection. | `MISSING` | Preserve; rebuild intentionally. | P2 | Existing visuals are legacy-specific. |
| Coinflip started | `PRESENT` - started event used segments, winner, landing side and time. | `PRESENT` - current protocol guards started args and renders `CoinflipEvent`. | `MISSING` | Preserve; design typed coinflip event for new app. | P2 | Requires segment/winner contract. |
| Dogs reward | `PRESENT` - normal alert visual/sound path using dogs assets/sounds. | `PRESENT` - handled as legacy reward-like key with dogs assets/sounds. | `PARTIAL` - `RewardAlert` has dogs copy, but not legacy visual/audio parity. | Preserve; new app needs reward media/visual spec. | P2 | Current new app copy is not the same as OBS visual parity. |
| Mute reward | `PRESENT` | `PRESENT` | `PARTIAL` - copy exists, visual/audio parity missing. | Preserve; rebuild with media contract. | P2 | Legacy key: `mute`. |
| Censure reward | `PRESENT` | `PRESENT` | `PARTIAL` - copy exists, visual/audio parity missing. | Preserve; rebuild with media contract. | P2 | Legacy key: `censure`. |
| Without R reward | `PRESENT` | `PRESENT` | `PARTIAL` - copy exists, visual/audio parity missing. | Preserve; rebuild with media contract. | P2 | Legacy key: `withoutR`. |
| Alert list set | `PRESENT` - accepted alert IDs through legacy `alertList` and sent `acceptAlert`. | `PRESENT` - current main overlay preserves alert queue and `acceptAlert`. | `MISSING` - new app uses typed event bus/queue, not legacy `alertList`. | Do not migrate 1:1 unless backend contract requires it. | P1 legacy / P3 new | New platform should prefer source-of-truth event delivery over old accept-list coupling. |
| Follower goal set | `PRESENT` - `/followers?account=:uuid`, `type: set`. | `PRESENT` - `PageChannelFollowers` supports `set`. | `MISSING` | Preserve legacy; new app needs goal widget contract. | P3 | Current new app supports only alert widget modes. |
| Follower goal update | `PRESENT` - `type: update`. | `PRESENT` - partial updates supported. | `MISSING` | Preserve legacy; design typed goal update event. | P3 | Verify exact current/goal number semantics during migration. |
| Sub goal set | `PRESENT` - `/subs?account=:uuid`, `type: set`. | `PRESENT` - `PageChannelSubs` supports `set`. | `MISSING` | Preserve legacy; new app needs goal widget contract. | P3 | Existing route must remain for OBS scenes. |
| Sub goal update | `PRESENT` - `type: update`. | `PRESENT` - partial updates supported. | `MISSING` | Preserve legacy; design typed goal update event. | P3 | Same `Goal` canvas component style in bridge. |
| Queue set | `PRESENT` - `/queue?account=:uuid`, `event: queue`, `key: set`. | `PRESENT` - `PageChannelQueue` maps list into queue models. | `MISSING` | Preserve legacy; new app needs queue widget if still required. | P3 | Current queue renders items after the first item. |
| Queue add | `PRESENT` | `PRESENT` - duplicate IDs ignored. | `MISSING` | Preserve behavior until replacement exists. | P3 | Add contract tests before migration. |
| Queue delete | `PRESENT` | `PRESENT` - removes matching item by id. | `MISSING` | Preserve behavior until replacement exists. | P3 | Verify delete semantics with real backend replay. |
| Explicit overlay routes | `OLD` - old build used `/channel/:uuid`, `/channel/:uuid/subs`, `/channel/:uuid/followers`, `/channel/:uuid/queue`. | `PRESENT` - current bridge uses `/ALERTS/:uuid`, `/TIP_ALERT/:uuid`, `/REWARD_ALERT/:uuid`, `/SUB_GOAL/:uuid`, `/FOLLOW_GOAL/:uuid`, `/QUEUE/:uuid`; removed `/channel/*` and `/test/channel/*` routes are rejected. | `MISSING` - new app must use explicit widget routes, not legacy channel-prefixed routes. | Historical old routes only. Do not document as active runtime behavior. | P0 bridge | OBS sources must be migrated to explicit routes. |
| Modern route aliases | `MISSING` in original build. | `PRESENT` - `/ALERTS/:uuid`, `/TIP_ALERT/:uuid`, `/REWARD_ALERT/:uuid`, `/SUB_GOAL/:uuid`, `/FOLLOW_GOAL/:uuid`, `/QUEUE/:uuid`. | `PRESENT / DIFFERENT` - new app supports `TIP_ALERT`, `REWARD_ALERT`, `ALL_ALERTS` token routes. | Use aliases carefully; document that legacy aliases are naming aliases only. | P1 | In `overlays-legacy`, aliases still use legacy `?account=:uuid` model. |
| WebSocket reconnect | `PRESENT` - manual reconnect with exponential-ish timeout capped near 10s. | `PRESENT / HARDENED` - centralized legacy socket controller and unavailable state after failure. | `PRESENT` - `useOverlaySocket` has bounded reconnect delays. | Keep tested reconnect behavior in both systems. | P0 | Avoid infinite silent failure in OBS. |
| Overlay unavailable state | `MISSING` - original mostly kept reconnecting/logging. | `PRESENT` - `OverlayUnavailable` renders after connection failure. | `PRESENT` - widget resolve errors/loading states and socket status UI exist. | Preserve clear operator feedback. | P0 | Do not expose noisy debug details in production OBS. |
| Fixture replay | `MISSING` in original frontend. | `PRESENT` - dev-gated fixture replay docs and route query fixtures. | `PARTIAL / TO VERIFY` - new app has test fixtures and overlay-lab, but not the same legacy fixture replay mechanism. | Keep legacy replay for bridge QA; build new replay separately. | P1 | Do not enable legacy fixture replay in production deploy. |
| OBS QA | `MISSING` as formal docs. | `PRESENT` - QA docs/checklists exist, including final OBS setup guide. | `UNKNOWN / TO VERIFY` | Keep manual OBS QA as release gate. | P0 | Automated tests do not replace OBS Browser Source verification. |
| Overlay token security | `MISSING` - old frontend/backend used public-ish account UUID model. | `MISSING / LEGACY MODEL` - aliases still use `?account=:uuid`; bridge intentionally does not change protocol. | `PRESENT` - new app supports overlay token routes and backend hash resolution. | Do not retrofit token model into bridge unless backend contract changes. | P0 new platform | New platform should own token security; bridge remains compatibility layer. |

## Migration decision rules

1. `overlays-legacy` changes should preserve legacy behavior first, even if the behavior is ugly.
2. `apps/overlays` should not claim parity until there is source code and tests for the feature.
3. Missing new-platform features should be marked `MISSING` or `UNKNOWN / TO VERIFY`, not hand-waved.
4. Visual parity requires OBS/manual fixture replay, not only unit tests.
5. WebSocket protocol changes require a documented backend contract change.
6. Security improvements belong primarily in the new platform unless the legacy backend contract is explicitly changed.

## Release checklist reference

Before treating a migration slice as complete, check:

- `docs/LEGACY_FRONTEND_POLICY_2026.md`
- `docs/OBS_SETUP_FINAL.md`
- `BACKEND_CONTRACT_SNAPSHOT_2026.md`
- `DEV_REPLAY_2026.md`
- `OBS_OVERLAY_QA_2026.md`
- `VERIFY_OVERLAY_EVENTS.md`

Minimum validation for code changes remains:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Docs-only changes should still run at least:

```bash
pnpm typecheck
```
