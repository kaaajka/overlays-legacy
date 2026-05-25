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
| `public/assets/images/subs/miecioch.png` | public runtime / goal image | `Goal.tsx` / goal CSS behavior | used | move later to `public/assets/images/goals/` if resolver is added |
| `public/assets/images/donate/dcba4b98efb5425eb46114645dcf706bfbd7aad6.gif` | suspicious historical donation media | historical/backend bundle identifier only | suspicious | keep until separate backend/history verification |
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
| `public/assets/sounds/donate/500b326786d86a9f10394cf0e7aa29d8706ed06e.mpga` | suspicious historical donation media | historical/backend bundle identifier only | suspicious | keep until separate backend/history verification |
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
| `src/assets/images/ui/money.png` | static CSS asset | `src/style/app.scss` | used | keep |
| `src/assets/resolveOverlayAssetUrl.ts` | source module | imported by components/config/tests | used | keep |
| `src/assets/resolveOverlayAssetUrl.test.ts` | test module | Vitest | used | keep |

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
```

No current source, fixture, SCSS/CSS, or active runtime references were found for these files. The Google Fonts remote import is still a separate external dependency decision.

## Do not delete yet

Do not delete these without a separate backend/history verification pass:

```txt
public/assets/images/donate/dcba4b98efb5425eb46114645dcf706bfbd7aad6.gif
public/assets/sounds/donate/500b326786d86a9f10394cf0e7aa29d8706ed06e.mpga
```

They are not used by current source paths, but historical/backend bundle grep found matching identifiers. Keeping them is safer than deleting possible old media references without stronger evidence.
