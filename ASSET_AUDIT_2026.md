# Asset Audit 2026 - overlays-legacy

## 1. Scope

This document audits runtime and build-time asset usage in `overlays-legacy`, the legacy OBS overlay frontend for the Kaaajka bot.

This document started as an audit-only snapshot. A later follow-up localized the coinflip runtime images while keeping the rest of the audit recommendations unchanged.

The scan covered:

- `src/`
- `public/`
- `src/style/*.scss` and generated CSS artifacts
- `src/dev/fixtures/*.json`
- donation templates
- reward, roulette and coinflip components

## 2. Current asset categories

### 2.1 Static import assets

Static import assets are bundled by Vite because they are imported from `src/`.

Current direct static imports:

| Asset | Referenced by | Classification | Recommendation |
|---|---|---:|---|
| `src/assets/images/without-r-alert.png` | `PageChannel.tsx` as `withoutRImage` | Static import asset | Keep. Renamed from `pobrane_1.png` for semantic usage. |
| `src/assets/images/mute-alert.png` | `PageChannel.tsx` as `muteImage` | Static import asset | Keep. Renamed from `pobrane_2.png` for semantic usage. |
| `src/assets/images/censure-alert.png` | `PageChannel.tsx` as `censureImage` | Static import asset | Keep. Renamed from `pobrane_3.png` for semantic usage. |
| `src/assets/images/dogs-reward-alert.png` | `PageChannel.tsx` as `dogsImage` | Static import asset | Keep. Renamed from `pobrane_5.png` for semantic usage. |
| `src/assets/images/roulette-alert.webp` | `PageChannel.tsx` as `rouletteImage` | Static import asset | Keep. Renamed from `pobrane_6.webp` for semantic usage. |
| `src/assets/images/coinflip-alert.gif` | `PageChannel.tsx` as `coinflipImage` | Static import asset | Keep. Renamed from `cat_surprised.gif` for semantic usage. |
| `src/assets/images/money.png` | `src/style/app.scss` as CSS relative URL | Static import/CSS asset | Keep in `src/assets` unless moved with CSS refactor. |

Notes:

- The previous `pobrane_*` static import names were replaced with semantic filenames in the same `src/assets/images/` folder.
- These assets are currently tied to the main alert overlay's static reward-like intro images. Moving them to another folder should still be done separately with route/fixture smoke checks.

### 2.2 Public runtime assets

Public runtime assets are referenced by URL at runtime and must exist under `public/` because backend payloads, fixtures, or overlay code resolve paths dynamically.

| Asset path | Referenced by | Classification | Recommendation |
|---|---|---:|---|
| `public/assets/sounds/1.mp3` to `11.mp3` | `PageChannel.tsx` random sound pool | Public runtime asset | Keep in `public/` until random sound system is renamed/documented. |
| `public/assets/sounds/12.mp3` to `15.mp3` | `PageChannel.tsx` secondary sound pool | Public runtime asset | Keep in `public/` until random sound system is renamed/documented. |
| `public/assets/sounds/spinning.mp3` | `RouletteEvent.tsx`, `CoinflipEvent.tsx` | Public runtime asset | Keep in `public/`; later move to `public/audio/roulette/` or `public/audio/shared/`. |
| `public/assets/sounds/win.mp3` | `RouletteEvent.tsx` | Public runtime asset | Keep in `public/`; later move to `public/audio/roulette/`. |
| `public/assets/images/roulette/*.png` | `RouletteEvent.tsx` via `item.image` | Public runtime asset / backend-driven filename | Keep in `public/`; these must be reachable by filename from backend/fixtures. |
| `public/assets/images/subs/miecioch.png` | `Goal.tsx` | Public runtime asset | Keep in `public/` unless Goal component is refactored to static import. |
| `public/assets/images/coinflip/head.png` | `src/style/app.scss` coinflip head image | Public runtime asset | Localized replacement for the previous external `seeklogo.com` runtime image. Keep in `public/` while SCSS references public URLs. |
| `public/assets/images/coinflip/tail.png` | `src/style/app.scss` coinflip tail image | Public runtime asset | Localized replacement for the previous external `kajkowo.../miecioch.png` runtime image. Dedicated coinflip copy; source remains available separately for Goal. |
| `public/media/gif/1.gif` to `7.gif` | `DonateEvent.tsx` template media | Public runtime asset | Keep in `public/`; donation templates resolve by stable runtime path. |
| `public/media/audio/1.mpga` to `7.mp3` | `DonateEvent.tsx` template audio | Public runtime asset | Keep in `public/`; donation templates resolve by stable runtime path. |

### 2.3 Fixture/backend-driven filenames

These are not direct imports. They come from fixture or backend payload fields and are resolved by frontend components.

| Reference | Source | Consumer | Required local target |
|---|---|---|---|
| `credits_1k.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/credits_1k.png` |
| `dogs.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/dogs.png` |
| `fast_3k.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/fast_3k.png` |
| `randomGame.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/randomGame.png` |
| `psc20.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/psc20.png` |
| `credits_5k.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/credits_5k.png` |
| `sub.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/sub.png` |
| `credits_10k.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/credits_10k.png` |
| `multilottery_30k.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/multilottery_30k.png` |
| `credits_50k.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/credits_50k.png` |
| `credits_100k.png` | `main-roulette-started.json` / backend roulette item | `RouletteEvent.tsx` | `public/assets/images/roulette/credits_100k.png` |
| `cat_surprised.gif` | coinflip fixtures | Fixture-only legacy field | The static imported asset was renamed to `src/assets/images/coinflip-alert.gif`. Fixture fields are intentionally unchanged in this rename-only pass because runtime coinflip rendering uses PageChannel image mapping, not these fixture image names. |
| `pobrane_6.webp` | roulette prepare fixture | Fixture-only legacy field | The static imported asset was renamed to `src/assets/images/roulette-alert.webp`. Fixture fields are intentionally unchanged in this rename-only pass; prepare fixture itself does not drive the started roulette wheel. |

Important: roulette started payloads are backend-driven by `item.image`, so those images must remain URL-addressable at runtime. That means `public/` is the correct place for them unless the backend changes to send full built asset URLs, which it currently does not.

### 2.4 External URL assets

These are runtime network dependencies or fixture-only remote URLs.

| Reference | Location | Classification | Risk |
|---|---|---:|---|
| Google Fonts import for `Poppins` and `Permanent Marker` | `src/style/app.scss` | External runtime CSS/font dependency | Risky for OBS: network failure changes text rendering. Should be self-hosted later. |
| Previous `seeklogo.com` coinflip head image | `src/style/app.scss` coinflip head image | Resolved former external runtime image dependency | Replaced with `public/assets/images/coinflip/head.png`. No runtime request to `seeklogo.com` should remain. |
| Previous `kajkowo.bdrewnowski.ovh` coinflip tail image | `src/style/app.scss` coinflip tail image | Resolved former external runtime image dependency | Replaced with `public/assets/images/coinflip/tail.png`. No runtime request to `kajkowo.bdrewnowski.ovh` should remain. |
| `https://tipply-prod-data.s3.waw.io.cloud.ovh.net/...mp3` | donate fixtures | Fixture/backend-driven TTS URL | Acceptable in fixtures; network success must not be required. |
| `https://cdn.7tv.app/emote/...webp` | donate HTML message fixtures | Fixture message content | Acceptable for fixture realism; should not be required for core overlay behavior. |
| `https://tipply.pl` fallback resolver | `resolveBackendAudioUrl.ts` | Backend-provided dynamic TTS/audio resolver | Acceptable for legacy compatibility. Do not replace TTS with local fake files. |

OBS risk summary: the coinflip external image risk is resolved. External fonts remain more dangerous than remote TTS in fixtures because font failure can silently change overlay visuals. TTS failure is already expected to be non-fatal.

### 2.5 Unused or suspicious assets

These files exist but were not found in direct code references during this audit. Some may be historical leftovers.

| Asset | Status | Recommendation |
|---|---|---|
| `public/assets/images/donate/dcba4b98efb5425eb46114645dcf706bfbd7aad6.gif` | Suspicious/unreferenced | Do not delete yet. Check old donate template history first. |
| `public/assets/sounds/assist/soundInit.mp3` | Suspicious/unreferenced | Candidate for later deletion or documentation. |
| `public/assets/sounds/donate/500b326786d86a9f10394cf0e7aa29d8706ed06e.mpga` | Suspicious/unreferenced | Candidate for later deletion only after checking old Tipply template mapping. |
| `src/assets/fonts/donations/*` | Suspicious/unreferenced | Likely legacy template fonts. No `@font-face` references found in current SCSS. Do not delete without visual comparison. |
| `src/assets/fonts/pxi*.woff2` | Suspicious/unreferenced | Looks like local Poppins font files, but current SCSS imports Google Fonts remotely. Candidate for self-hosting migration. |
| `src/style/app.css` | Suspicious generated CSS | Runtime likely imports `app.scss`; confirm before deletion. Do not edit in asset migration. |

## 3. What should stay in public

Keep these in `public/` for now:

- Backend/fixture-driven reward images:
  - `public/assets/images/roulette/*.png`
- Runtime audio addressed by stable URL:
  - `public/assets/sounds/*.mp3`
  - `public/assets/sounds/spinning.mp3`
  - `public/assets/sounds/win.mp3`
- Donation template media addressed by stable URL:
  - `public/media/gif/*`
  - `public/media/audio/*`
- Goal overlay runtime image if not statically imported:
  - `public/assets/images/subs/miecioch.png`

Reason: these are not just build-time module imports. They are addressed by URL strings or backend-provided filenames. Moving them to `src/` would break runtime lookup unless the code/backend contract changes.

## 4. What should stay in src

Keep these in `src/` for now:

- Statically imported main alert images:
  - `src/assets/images/without-r-alert.png`
  - `src/assets/images/mute-alert.png`
  - `src/assets/images/censure-alert.png`
  - `src/assets/images/dogs-reward-alert.png`
  - `src/assets/images/roulette-alert.webp`
  - `src/assets/images/coinflip-alert.gif`
- CSS-referenced source image:
  - `src/assets/images/money.png`

Reason: these are part of bundled UI styling/component imports. They are not currently backend-addressed public filenames.

## 5. Assets that should be moved later

Do not do this in one commit. Recommended later migrations:

1. **Coinflip images - resolved**
   - Previous external coinflip head/tail images are now local runtime assets.
   - Current paths: `public/assets/images/coinflip/head.png` and `public/assets/images/coinflip/tail.png`.
   - Keep these paths stable unless doing a dedicated public asset structure migration.

2. **Self-host Google Fonts**
   - Current SCSS imports Google Fonts remotely.
   - Local `src/assets/fonts/pxi*.woff2` probably already contains Poppins-like font files, but this must be verified before replacing `@import`.

3. **Static alert image rename - completed**
   - Previous ambiguous names were renamed:
     - `pobrane_1.png` -> `without-r-alert.png`
     - `pobrane_2.png` -> `mute-alert.png`
     - `pobrane_3.png` -> `censure-alert.png`
     - `pobrane_5.png` -> `dogs-reward-alert.png`
     - `pobrane_6.webp` -> `roulette-alert.webp`
     - `cat_surprised.gif` -> `coinflip-alert.gif`
   - A future folder move to `src/assets/ui/` is optional and should be handled separately.

4. **Normalize public runtime folders**
   - See target structure below.
   - Keep compatibility wrappers or update `AppConfig.assetUrl(...)` paths carefully.

5. **Remove suspicious old assets**
   - Only after grep + visual QA + fixture replay proves they are unused.

## 6. Recommended target structure

Target structure requested for future migrations:

```txt
public/audio/
public/images/rewards/
public/images/templates/
public/gifs/
src/assets/ui/
```

Suggested mapping:

```txt
public/audio/random/1.mp3 ... 15.mp3
public/audio/roulette/spinning.mp3
public/audio/roulette/win.mp3
public/audio/templates/1.mpga ... 7.mp3
public/images/rewards/roulette/credits_1k.png ... credits_100k.png
public/images/templates/donate/*.gif
public/gifs/donate/1.gif ... 7.gif
src/assets/ui/reward-censure.png
src/assets/ui/reward-mute.png
src/assets/ui/reward-without-r.png
src/assets/ui/reward-dogs.png
src/assets/ui/reward-roulette.webp
src/assets/ui/reward-coinflip.gif
src/assets/ui/money.png
```

Caution: the target structure is not compatible with current hardcoded paths. It requires a dedicated migration commit with tests and OBS visual QA.

## 7. Runtime risk list

Highest remaining external dependencies for OBS:

1. Google Fonts remote import.
2. Fixture remote TTS URLs, but these should already fail safely and are not required for `muteAudio=true` fixture QA.
3. Remote emote images inside donated HTML messages.

Resolved:

- `seeklogo.com` coinflip head image -> `public/assets/images/coinflip/head.png`.
- `kajkowo.bdrewnowski.ovh` coinflip tail image -> `public/assets/images/coinflip/tail.png`.

## 8. Recommended cleanup order

1. Add this audit document.
2. Self-host coinflip head/tail images and update SCSS references. Done: `public/assets/images/coinflip/head.png` and `public/assets/images/coinflip/tail.png`.
3. Decide Google Fonts strategy:
   - keep remote for now, or
   - add verified local `@font-face` files and remove Google import.
4. Static imported UI assets have semantic names now; only move them later if a dedicated folder cleanup is needed.
5. Normalize `public/assets/sounds` and `public/media` into the target folder structure with compatibility QA.
6. Audit and remove unreferenced legacy assets only after manual OBS visual checks.

## 9. Do not do yet

Do not:

- Move all assets at once.
- Replace backend-driven roulette filenames with static imports.
- Move TTS into `public/`.
- Delete old donation/font files just because grep did not find direct references.
- Change backend payload filenames in the frontend asset cleanup.
- Mix visual asset migration with routing, WebSocket, or protocol changes.
