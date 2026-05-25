# Asset Audit 2026 - overlays-legacy

## Scope

This audit documents the current overlay asset architecture after the asset finalization pass.

The guiding rule is:

- `public/` contains runtime URL assets used by OBS overlays, backend/fixture filenames, media playback, and CSS public URLs.
- `src/assets/` contains static assets imported or referenced by React/TypeScript/SCSS modules and bundled by Vite.
- There is no quarantine/legacy folder. Files with no verified references were removed; files with possible historical/backend references were kept in place and documented.

## Final target structure

```txt
public/assets/images/rewards/
public/assets/images/coinflip/
public/assets/images/goals/

public/assets/sounds/rewards/random/
public/assets/sounds/rewards/coinflip/
public/assets/sounds/shared/

public/assets/donations/audio/
public/assets/donations/gif/

src/assets/images/alerts/
src/assets/images/effects/
```

`src/assets/images/alerts/` contains static alert presentation images imported by frontend modules. `src/assets/images/effects/` contains static build-time visual effect particles/assets such as the banknote particle used by the money rain effect. Public reward images stay under `public/assets/images/rewards/` because backend/fixture payloads provide legacy image filename strings and the frontend resolver maps those strings to local public assets.

## Static import / bundled assets

These are owned by frontend source modules and should stay under `src/assets/`.

| Current path | Usage | Status |
|---|---|---|
| `src/assets/images/alerts/without-r-alert.png` | `PageChannel` alert image for `withoutR` | used |
| `src/assets/images/alerts/mute-alert.png` | `PageChannel` alert image for `mute` | used |
| `src/assets/images/alerts/censure-alert.png` | `PageChannel` alert image for `censure` | used |
| `src/assets/images/alerts/dogs-reward-alert.png` | `PageChannel` alert image for `dogs` | used |
| `src/assets/images/alerts/roulette-alert.webp` | `PageChannel` alert image for `roulette` | used |
| `src/assets/images/alerts/coinflip-alert.gif` | `PageChannel` alert image for `coinflip` | used |
| `src/assets/images/effects/banknote-particle.png` | SCSS decorative banknote particle for money rain visual effect | used |

Previous non-semantic static import names were replaced:

| Old path | New path |
|---|---|
| `src/assets/images/pobrane_1.png` | `src/assets/images/alerts/without-r-alert.png` |
| `src/assets/images/pobrane_2.png` | `src/assets/images/alerts/mute-alert.png` |
| `src/assets/images/pobrane_3.png` | `src/assets/images/alerts/censure-alert.png` |
| `src/assets/images/pobrane_5.png` | `src/assets/images/alerts/dogs-reward-alert.png` |
| `src/assets/images/pobrane_6.webp` | `src/assets/images/alerts/roulette-alert.webp` |
| `src/assets/images/cat_surprised.gif` | `src/assets/images/alerts/coinflip-alert.gif` |

## Public runtime assets

These are URL-addressable at runtime and must remain under `public/`.

### Reward roulette images

Reward images now live in:

```txt
public/assets/images/rewards/
```

Canonical local filenames:

```txt
credits-1k.png
credits-5k.png
credits-10k.png
credits-50k.png
credits-100k.png
dogs.png
fast-3k.png
random-game.png
psc-20.png
sub.png
multi-lottery-30k.png
```

Backend/fixture compatibility is preserved in `resolveRewardImageUrl()`. The backend may still send old names, and the frontend maps them to canonical files:

| Backend / fixture filename | Local canonical file |
|---|---|
| `credits_1k.png` | `assets/images/rewards/credits-1k.png` |
| `credits_5k.png` | `assets/images/rewards/credits-5k.png` |
| `credits_10k.png` | `assets/images/rewards/credits-10k.png` |
| `credits_50k.png` | `assets/images/rewards/credits-50k.png` |
| `credits_100k.png` | `assets/images/rewards/credits-100k.png` |
| `fast_3k.png` | `assets/images/rewards/fast-3k.png` |
| `randomGame.png` | `assets/images/rewards/random-game.png` |
| `psc20.png` | `assets/images/rewards/psc-20.png` |
| `multilottery_30k.png` | `assets/images/rewards/multi-lottery-30k.png` |
| `dogs.png` | `assets/images/rewards/dogs.png` |
| `sub.png` | `assets/images/rewards/sub.png` |

### Coinflip images

Coinflip images are local runtime assets:

```txt
public/assets/images/coinflip/head.png
public/assets/images/coinflip/tail.png
```

The previous external runtime dependencies from `seeklogo.com` and `kajkowo.bdrewnowski.ovh` have been removed from active source references.

### Goal images

Goal overlay artwork now lives in:

```txt
public/assets/images/goals/kaaajk4-love.png
```

The display/content label is `kaaajk4Love`, but the filename is intentionally kebab-case. `Goal.tsx` resolves this file through `resolveGoalImageUrl("kaaajk4-love")`, so the old misleading subs-named goal image path is gone.

### Reward sounds

Random reward sounds now live in:

```txt
public/assets/sounds/rewards/random/random-01.mp3
...
public/assets/sounds/rewards/random/random-11.mp3
```

Coinflip prepare sounds now live in:

```txt
public/assets/sounds/rewards/coinflip/coinflip-prepare-01.mp3
...
public/assets/sounds/rewards/coinflip/coinflip-prepare-04.mp3
```

Shared event sounds now live in:

```txt
public/assets/sounds/shared/spinning.mp3
public/assets/sounds/shared/win.mp3
```

### Donation media

Donation template media now lives in:

```txt
public/assets/donations/audio/donation-template-01.mpga
public/assets/donations/audio/donation-template-02.mpga
public/assets/donations/audio/donation-template-03.mpga
public/assets/donations/audio/donation-template-04.mpga
public/assets/donations/audio/donation-template-05.mp3
public/assets/donations/audio/donation-template-06.mpga
public/assets/donations/audio/donation-template-07.mp3

public/assets/donations/gif/donation-template-01.gif
...
public/assets/donations/gif/donation-template-07.gif
```

TTS remains backend-provided and must not be moved into `public/` as fake local files.

## Runtime asset resolvers

Public runtime URL construction is centralized in:

```txt
src/assets/resolveOverlayAssetUrl.ts
```

Current exported helpers:

```txt
resolvePublicAssetUrl(path)
resolveRewardImageUrl(filename)
resolveCoinflipImageUrl(side)
resolveGoalImageUrl(name)
resolveRewardRandomSoundUrl(index)
resolveCoinflipPrepareSoundUrl(index)
resolveSharedEventSoundUrl(name)
resolveDonationAudioUrl(templateIndex)
resolveDonationGifUrl(templateIndex)
```

All helpers are BASE_URL-safe and avoid double slashes.

## Deleted unused files

The following assets had no verified current references in `src/`, fixtures, SCSS/CSS, or active runtime code and were removed:

```txt
public/assets/sounds/assist/soundInit.mp3
src/assets/fonts/donations/*
src/assets/fonts/pxi*.woff2
```

## Removed final leftovers

The old hash-named donation leftovers were removed after exact-reference checks found no active runtime/code references in frontend source, fixtures, SCSS/CSS, docs, or backend source:

```txt
removed hash-named donation gif
removed hash-named donation sound
```

The empty hash-named donation media directories and the old misleading subs-named goal directory were removed.

## Remaining external runtime dependencies

Active coinflip external image dependencies were resolved. The Google Fonts runtime import was removed and Poppins is now self-hosted under:

```txt
public/assets/fonts/poppins/
```

The overlay should no longer request `fonts.googleapis.com` or `fonts.gstatic.com` for Poppins.

## Next cleanup candidates

1. Continue visual QA for goal, donation, roulette, coinflip, and font rendering after asset path changes.
2. If the decorative `Permanent Marker` look must be preserved exactly, add a separately verified local font asset in a dedicated follow-up. Do not reintroduce Google Fonts.
