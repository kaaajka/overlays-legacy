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
src/assets/images/ui/
```

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
| `src/assets/images/ui/money.png` | SCSS decorative UI/background asset | used |

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

`public/assets/images/subs/miecioch.png` is still used by the goal overlay. It has not been moved yet because the current target structure reserves `public/assets/images/goals/` for a later goal asset pass.

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

## Kept despite being suspicious

The following files are not active in current frontend source paths, but they were kept because historical/backend bundle grep showed matching old media identifiers. Removing them safely requires a separate backend/history verification pass:

```txt
public/assets/images/donate/dcba4b98efb5425eb46114645dcf706bfbd7aad6.gif
public/assets/sounds/donate/500b326786d86a9f10394cf0e7aa29d8706ed06e.mpga
```

They are not part of the recommended current asset architecture, but keeping them is safer than deleting possible historical runtime media without stronger evidence.

## Remaining external runtime dependencies

Active coinflip external image dependencies were resolved. The remaining known external dependency is the Google Fonts import in SCSS. Replacing it with self-hosted fonts should be a separate visual QA task.

## Next cleanup candidates

1. Decide whether `public/assets/images/subs/miecioch.png` should move to `public/assets/images/goals/` with a resolver.
2. Replace remote Google Fonts with verified self-hosted fonts if typography must be OBS-offline-safe.
3. Investigate and either document or delete the two kept historical donate media files after backend/history verification.
