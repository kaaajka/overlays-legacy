# Asset Usage Inventory 2026 - overlays-legacy

## Scope

This is the exact asset inventory after the asset architecture finalization pass. It lists all current files under `public/` and `src/assets/` and classifies their usage.

## Inventory

| File path | Category | References | Status | Recommended action |
|---|---|---|---|---|
| `public/robots.txt` | static public file | deployment/browser | used | keep |
| `public/assets/images/rewards/credits-1k.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `credits_1k.png` | used dynamically | keep |
| `public/assets/images/rewards/credits-5k.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `credits_5k.png` | used dynamically | keep |
| `public/assets/images/rewards/credits-10k.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `credits_10k.png` | used dynamically | keep |
| `public/assets/images/rewards/credits-50k.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `credits_50k.png` | used dynamically | keep |
| `public/assets/images/rewards/credits-100k.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `credits_100k.png` | used dynamically | keep |
| `public/assets/images/rewards/dogs.png` | public runtime / backend filename | roulette fixtures/backend item image | used dynamically | keep |
| `public/assets/images/rewards/fast-3k.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `fast_3k.png` | used dynamically | keep |
| `public/assets/images/rewards/random-game.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `randomGame.png` | used dynamically | keep |
| `public/assets/images/rewards/psc-20.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `psc20.png` | used dynamically | keep |
| `public/assets/images/rewards/sub.png` | public runtime / backend filename | roulette fixtures/backend item image | used dynamically | keep |
| `public/assets/images/rewards/multi-lottery-30k.png` | public runtime / backend filename mapped | `resolveRewardImageUrl()` maps `multilottery_30k.png` | used dynamically | keep |
| `public/assets/images/coinflip/head.png` | public runtime / SCSS reference | `src/style/app.scss` | used | keep |
| `public/assets/images/coinflip/tail.png` | public runtime / SCSS reference | `src/style/app.scss` | used | keep |
| `public/assets/images/goals/kaaajk4-love.png` | public runtime / goal image | `Goal.tsx` via `resolveGoalImageUrl("kaaajk4-love")` | used | keep |
| `public/assets/sounds/rewards/random/random-01.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(1)` | used | keep |
| `public/assets/sounds/rewards/random/random-02.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(2)` | used | keep |
| `public/assets/sounds/rewards/random/random-03.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(3)` | used | keep |
| `public/assets/sounds/rewards/random/random-04.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(4)` | used | keep |
| `public/assets/sounds/rewards/random/random-05.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(5)` | used | keep |
| `public/assets/sounds/rewards/random/random-06.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(6)` | used | keep |
| `public/assets/sounds/rewards/random/random-07.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(7)` | used | keep |
| `public/assets/sounds/rewards/random/random-08.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(8)` | used | keep |
| `public/assets/sounds/rewards/random/random-09.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(9)` | used | keep |
| `public/assets/sounds/rewards/random/random-10.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(10)` | used | keep |
| `public/assets/sounds/rewards/random/random-11.mp3` | public runtime sound | `resolveRewardRandomSoundUrl(11)` | used | keep |
| `public/assets/sounds/rewards/coinflip/coinflip-prepare-01.mp3` | public runtime sound | `resolveCoinflipPrepareSoundUrl(1)` | used | keep |
| `public/assets/sounds/rewards/coinflip/coinflip-prepare-02.mp3` | public runtime sound | `resolveCoinflipPrepareSoundUrl(2)` | used | keep |
| `public/assets/sounds/rewards/coinflip/coinflip-prepare-03.mp3` | public runtime sound | `resolveCoinflipPrepareSoundUrl(3)` | used | keep |
| `public/assets/sounds/rewards/coinflip/coinflip-prepare-04.mp3` | public runtime sound | `resolveCoinflipPrepareSoundUrl(4)` | used | keep |
| `public/assets/sounds/shared/spinning.mp3` | public runtime shared sound | `resolveSharedEventSoundUrl("spinning")` | used | keep |
| `public/assets/sounds/shared/win.mp3` | public runtime shared sound | `resolveSharedEventSoundUrl("win")` | used | keep |
| `public/assets/donations/audio/donation-template-01.mpga` | public runtime donation audio | `resolveDonationAudioUrl(1)` | used | keep |
| `public/assets/donations/audio/donation-template-02.mpga` | public runtime donation audio | `resolveDonationAudioUrl(2)` | used | keep |
| `public/assets/donations/audio/donation-template-03.mpga` | public runtime donation audio | `resolveDonationAudioUrl(3)` | used | keep |
| `public/assets/donations/audio/donation-template-04.mpga` | public runtime donation audio | `resolveDonationAudioUrl(4)` | used | keep |
| `public/assets/donations/audio/donation-template-05.mp3` | public runtime donation audio | `resolveDonationAudioUrl(5)` | used | keep |
| `public/assets/donations/audio/donation-template-06.mpga` | public runtime donation audio | `resolveDonationAudioUrl(6)` | used | keep |
| `public/assets/donations/audio/donation-template-07.mp3` | public runtime donation audio | `resolveDonationAudioUrl(7)` | used | keep |
| `public/assets/donations/gif/donation-template-01.gif` | public runtime donation gif | `resolveDonationGifUrl(1)` | used | keep |
| `public/assets/donations/gif/donation-template-02.gif` | public runtime donation gif | `resolveDonationGifUrl(2)` | used | keep |
| `public/assets/donations/gif/donation-template-03.gif` | public runtime donation gif | `resolveDonationGifUrl(3)` | used | keep |
| `public/assets/donations/gif/donation-template-04.gif` | public runtime donation gif | `resolveDonationGifUrl(4)` | used | keep |
| `public/assets/donations/gif/donation-template-05.gif` | public runtime donation gif | `resolveDonationGifUrl(5)` | used | keep |
| `public/assets/donations/gif/donation-template-06.gif` | public runtime donation gif | `resolveDonationGifUrl(6)` | used | keep |
| `public/assets/donations/gif/donation-template-07.gif` | public runtime donation gif | `resolveDonationGifUrl(7)` | used | keep |
| `src/assets/images/alerts/without-r-alert.png` | static import asset | `PageChannel.tsx` | used | keep |
| `src/assets/images/alerts/mute-alert.png` | static import asset | `PageChannel.tsx` | used | keep |
| `src/assets/images/alerts/censure-alert.png` | static import asset | `PageChannel.tsx` | used | keep |
| `src/assets/images/alerts/dogs-reward-alert.png` | static import asset | `PageChannel.tsx` | used | keep |
| `src/assets/images/alerts/roulette-alert.webp` | static import asset | `PageChannel.tsx` | used | keep |
| `src/assets/images/alerts/coinflip-alert.gif` | static import asset | `PageChannel.tsx` | used | keep |
| `src/assets/images/effects/banknote-particle.png` | static CSS visual effect asset | `src/style/app.scss` | used | keep |
| `src/assets/resolveOverlayAssetUrl.ts` | source module | imported by components/config/tests | used | keep |
| `src/assets/resolveOverlayAssetUrl.test.ts` | test module | Vitest | used | keep |

## Static asset folders

- `src/assets/images/alerts/` contains static alert presentation images imported by frontend modules.
- `src/assets/images/effects/` contains static build-time visual effect particles/assets. `banknote-particle.png` is used by SCSS for the money rain effect and is not a generic UI icon.
- `public/assets/images/rewards/` contains runtime reward images resolved from backend/fixture payload filenames. The backend does not know frontend files directly; it sends legacy image filename strings, and the frontend resolver maps them to local public assets.

## Backend filename compatibility mapping

`resolveRewardImageUrl()` keeps the current backend/fixture contract working even though local files now use canonical kebab-case names.

| Legacy backend filename | Canonical local filename |
|---|---|
| `credits_1k.png` | `credits-1k.png` |
| `credits_5k.png` | `credits-5k.png` |
| `credits_10k.png` | `credits-10k.png` |
| `credits_50k.png` | `credits-50k.png` |
| `credits_100k.png` | `credits-100k.png` |
| `fast_3k.png` | `fast-3k.png` |
| `randomGame.png` | `random-game.png` |
| `psc20.png` | `psc-20.png` |
| `multilottery_30k.png` | `multi-lottery-30k.png` |

## Deleted after reference check

Removed files/directories:

```txt
public/assets/sounds/assist/soundInit.mp3
src/assets/fonts/donations/*
src/assets/fonts/pxi*.woff2
removed hash-named donation gif
removed hash-named donation sound
removed hash-named donation image directory
removed hash-named donation sound directory
removed old subs-named goal image directory
```

No current source, fixture, SCSS/CSS, docs, or backend source references were found for these files/paths.

The previous Google Fonts remote import was removed. Poppins is now self-hosted from `public/assets/fonts/poppins/`.


## Self-hosted font assets

| Asset path | Category | References | Status | Recommended action |
|---|---|---|---|---|
| `public/assets/fonts/poppins/OFL.txt` | public runtime/license asset | License file for bundled Poppins font files | used | keep |
| `public/assets/fonts/poppins/poppins-regular.ttf` | public runtime font asset | `src/style/app.scss` `@font-face` weight 400 | used | keep |
| `public/assets/fonts/poppins/poppins-medium.ttf` | public runtime font asset | `src/style/app.scss` `@font-face` weight 500 | used | keep |
| `public/assets/fonts/poppins/poppins-semibold.ttf` | public runtime font asset | `src/style/app.scss` `@font-face` weight 600 | used | keep |
| `public/assets/fonts/poppins/poppins-bold.ttf` | public runtime font asset | `src/style/app.scss` `@font-face` weight 700 | used | keep |

Poppins is intentionally stored in `public/` because OBS/browser-source runtime loads font files by URL. Do not move these font files into `src/assets/` unless the styling is changed to use bundler-resolved asset URLs.

## Do not delete yet

No hash-named donation leftovers remain. Future deletion candidates must go through the same exact-reference check before removal.
