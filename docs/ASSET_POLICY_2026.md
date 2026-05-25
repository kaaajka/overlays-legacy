# Legacy overlay asset policy 2026

## Purpose

This policy prevents asset chaos from returning to `overlays-legacy`.

`overlays-legacy` is a stabilized legacy OBS frontend. Assets are part of the runtime contract because OBS overlays depend on exact visual output, audio timing, transparent backgrounds and predictable public paths. Do not treat asset changes as harmless cleanup.

The goal is simple: every asset must have an obvious location, a meaningful name and a verified overlay use case.

## 1. Source of truth for static public assets

Static assets that must be served by URL at runtime belong in `public/assets`.

These paths are the expected legacy locations:

| Asset category | Required location | Notes |
|---|---|---|
| Donation template GIF assets | `public/assets/donations/gif/` | Used by donation template visuals. Do not move without a real bug and fixture verification. |
| Donation template audio assets | `public/assets/donations/audio/` | Used by donation template sounds before TTS playback. Do not rename casually. |
| Reward images | `public/assets/images/rewards/` | Used by reward overlays such as dogs, mute, censure and without R. |
| Goal images | `public/assets/images/goals/` | Used by follower/sub goal canvas rendering. |
| Shared sounds | `public/assets/sounds/shared/` | Use this for sounds shared by multiple overlay flows. |

Do not create new random top-level public folders for overlay runtime assets unless the existing structure clearly cannot represent the asset type.

## 2. `src/assets` usage

`src/assets` is allowed only when bundling/importing through Vite is intentional.

Use `src/assets` for code-level helpers or imported UI assets when the asset should be part of the application bundle.

Do not put OBS runtime assets in `src/assets` just because it is convenient. If OBS needs to load the file through a stable public URL, the asset usually belongs under `public/assets` instead.

Current helper files such as `src/assets/resolveOverlayAssetUrl.ts` are code utilities, not a dumping ground for media files.

## 3. Backend-generated audio and TTS/cache paths

Backend-generated TTS/cache audio paths must be resolved through the existing backend audio URL resolver.

Use:

```ts
resolveBackendAudioUrl(value)
```

Do not hardcode raw `/ttscache/...` paths inside visual components.

Bad:

```ts
const audioUrl = "/ttscache/example.mp3";
```

Good:

```ts
const audioUrl = resolveBackendAudioUrl(speechMessagePath);
```

Reason: visual components should not know backend URL rules. Hardcoded backend paths inside components turn into production trash when backend hostnames, relative paths or CDN rules change.

## 4. Naming rules

Every new asset must have a meaningful name.

Forbidden examples:

```txt
pobrane_1.png
image.png
new.png
final.png
final-final.png
test.mp3
copy.gif
```

Acceptable examples:

```txt
donation-template-08.gif
donation-template-08.mp3
reward-dogs-overlay.webp
reward-mute-loop.gif
goal-followers-ring-background.png
shared-alert-pop.mp3
coinflip-started-heads.webp
```

A good filename should answer at least two questions without opening the file:

- What feature uses it?
- What role does it play?
- Which variant/template/state is it?

## 5. Donation assets

Donation template assets are especially sensitive because donation behavior depends on visual timing, sound timing and TTS order.

Rules:

- Donation GIFs live in `public/assets/donations/gif/`.
- Donation audio lives in `public/assets/donations/audio/`.
- Do not rename existing donation assets unless there is a documented bug.
- Do not change donation asset paths inside the resolver without fixture replay or OBS manual QA.
- Do not add a donation template asset without confirming the corresponding template config and selected threshold behavior.
- Do not replace a donation sound with a different duration casually. Duration affects perceived alert timing.

Every new or changed donation asset must be tested with fixture replay or OBS manual QA.

Minimum checks:

- donation template renders correctly,
- template sound plays before TTS,
- TTS nickname plays in the expected step,
- TTS amount plays in the expected step,
- TTS message plays in the expected step,
- missing audio fallback does not block the queue,
- transparent background still works in OBS.

## 6. Reward assets

Reward images live in:

```txt
public/assets/images/rewards/
```

Reward-related sounds should use the existing sound structure under:

```txt
public/assets/sounds/rewards/
public/assets/sounds/shared/
```

Rules:

- Keep reward asset names tied to the reward name or state.
- Do not reuse unrelated files because they “look close enough”. That is how legacy projects rot.
- Do not move reward assets without checking all reward flows.

Every new or changed reward asset must be tested with fixture replay or OBS manual QA.

Minimum reward checks:

- dogs reward,
- mute reward,
- censure reward,
- without R reward,
- audio playback if the reward uses sound,
- transparent background in OBS,
- no stale cached asset after refresh.

## 7. Goal assets

Goal images live in:

```txt
public/assets/images/goals/
```

Goal overlays are canvas-based. Asset changes can break canvas rendering, sizing, transparency or progress alignment.

Rules:

- Do not change goal image paths without a real bug.
- Do not replace goal images without checking follower and sub goal overlays.
- Do not change image dimensions casually. Canvas drawing may depend on expected proportions.

Minimum goal checks:

- follower goal initial set,
- follower goal update,
- sub goal initial set,
- sub goal update,
- transparent canvas background,
- correct appearance in a `1920x1080` OBS Browser Source.

## 8. Shared sounds

Shared sounds live in:

```txt
public/assets/sounds/shared/
```

Use shared sounds only when the same sound is intentionally reused across multiple overlay features.

Do not put feature-specific sounds in `shared` just to avoid creating a clearer location. If a sound belongs only to roulette, coinflip or a specific reward, keep it near that feature category where the current structure supports it.

## 9. Asset review checklist

Before adding or changing an asset, answer these questions:

- [ ] Is this asset needed by a real overlay behavior?
- [ ] Is the location consistent with this policy?
- [ ] Is the filename meaningful?
- [ ] Is the file format appropriate for OBS Browser Source?
- [ ] Is the file size reasonable for runtime loading?
- [ ] Does the asset preserve transparent background where required?
- [ ] Does it avoid changing existing visual output unless the change is intentional and documented?
- [ ] Has fixture replay or OBS manual QA verified the affected overlay?

## 10. What not to do

Do not:

- add random downloaded filenames,
- add unused assets “for later”,
- hardcode backend audio/cache paths in visual components,
- move assets during unrelated refactors,
- rename assets without checking every reference,
- change donation/reward/goal visuals as part of technical cleanup,
- assume browser preview is enough when OBS is the real runtime.

If an asset change cannot be verified in fixture replay or OBS manual QA, it is not ready to ship.

## 11. Related documents

Use this policy together with:

- `docs/LEGACY_FRONTEND_POLICY_2026.md`
- `docs/OBS_SETUP_FINAL.md`
- `docs/FEATURE_PARITY_MATRIX_2026.md`
- `docs/RELEASE_CHECKLIST.md`
