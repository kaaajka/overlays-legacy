# Asset Usage Inventory 2026

This document is an exact inventory of runtime and source assets in `overlays-legacy` as of the current frontend state. It is intentionally documentation-only. No files were moved, renamed, deleted, or re-imported in this pass.

The goal is to prevent stupid cleanup: deleting or moving assets without knowing whether OBS overlays, fixtures, SCSS, or backend-driven filenames still depend on them.

## Method

- Listed every file under `public/` and `src/assets/`.
- Searched textual references in `src/`, `public/`, fixtures, SCSS/CSS, and docs.
- Classified dynamic assets separately from static imports because roulette and some overlay URLs are backend/fixture-driven.
- Docs references are listed but do not by themselves prove runtime usage.

## Recommended target structure

```txt
public/audio/
public/images/rewards/
public/images/templates/
public/gifs/
src/assets/ui/
```

Do not jump straight into this move. First keep compatibility paths or migrate one asset family at a time with OBS visual QA.

## Inventory table

| Asset file | Category | References found | Status | Recommended action | Notes |
|---|---|---|---|---|---|
| `public/assets/images/coinflip/head.png` | SCSS reference / public runtime | SCSS/CSS: src/style/app.scss<br>docs: ASSET_AUDIT_2026.md | used | keep | Coinflip face image referenced by app.scss variables. |
| `public/assets/images/coinflip/tail.png` | SCSS reference / public runtime | SCSS/CSS: src/style/app.scss<br>docs: ASSET_AUDIT_2026.md | used | keep | Coinflip face image referenced by app.scss variables. |
| `public/assets/images/donate/dcba4b98efb5425eb46114645dcf706bfbd7aad6.gif` | public runtime / suspicious | docs: ASSET_AUDIT_2026.md | suspicious | delete only after visual QA | No current runtime reference found; likely old donation template media. |
| `public/assets/images/roulette/credits_100k.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/credits_10k.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/credits_1k.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/credits_50k.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/credits_5k.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/dogs.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/fast_3k.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/multilottery_30k.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/psc20.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/randomGame.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/roulette/sub.png` | public runtime / fixture-driven / backend-driven filename | fixtures: src/dev/fixtures/main-roulette-started.json<br>docs: ASSET_AUDIT_2026.md | probably used dynamically | keep | Loaded by RouletteEvent from item.image; fixtures/backend provide filenames. |
| `public/assets/images/subs/miecioch.png` | public runtime | src: src/components/Goal.tsx<br>docs: ASSET_AUDIT_2026.md, DEPENDENCY_AUDIT_2026.md | used | keep | Goal canvas background image loaded by direct public path. |
| `public/assets/sounds/1.mp3` | public runtime | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/10.mp3` | public runtime | src: src/components/PageChannel.tsx | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/11.mp3` | public runtime | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/12.mp3` | public runtime | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/13.mp3` | public runtime | src: src/components/PageChannel.tsx | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/14.mp3` | public runtime | src: src/components/PageChannel.tsx | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/15.mp3` | public runtime | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/2.mp3` | public runtime | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/3.mp3` | public runtime | src: src/components/PageChannel.tsx<br>fixtures: src/dev/fixtures/main-donate-html-message.json, src/dev/fixtures/main-donate-prepare.json, src/dev/fixtures/main-donate-without-audio-url.json | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/4.mp3` | public runtime | src: src/components/PageChannel.tsx | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/5.mp3` | public runtime | src: src/components/DonateEvent.tsx, src/components/PageChannel.tsx<br>fixtures: src/dev/fixtures/main-donate-html-message.json, src/dev/fixtures/main-donate-prepare.json, src/dev/fixtures/main-donate-without-audio-url.json<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/6.mp3` | public runtime | src: src/components/PageChannel.tsx | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/7.mp3` | public runtime | src: src/components/DonateEvent.tsx, src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/8.mp3` | public runtime | src: src/components/PageChannel.tsx | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/9.mp3` | public runtime | src: src/components/PageChannel.tsx | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/assist/soundInit.mp3` | public runtime / suspicious | docs: ASSET_AUDIT_2026.md | suspicious | delete only after visual QA | No current source reference found except docs/audit; may be legacy template or assist sound. |
| `public/assets/sounds/donate/500b326786d86a9f10394cf0e7aa29d8706ed06e.mpga` | public runtime / suspicious | docs: ASSET_AUDIT_2026.md | suspicious | delete only after visual QA | No current source reference found except docs/audit; may be legacy template or assist sound. |
| `public/assets/sounds/spinning.mp3` | public runtime | src: src/components/CoinflipEvent.tsx, src/components/RouletteEvent.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/assets/sounds/win.mp3` | public runtime | src: src/components/RouletteEvent.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Random/event/roulette/coinflip sound loaded through AppConfig.assetUrl. |
| `public/media/audio/1.mpga` | public runtime | src: src/components/DonateEvent.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Donate template audio loaded through AppConfig.assetUrl. |
| `public/media/audio/2.mpga` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template audio loaded through AppConfig.assetUrl. |
| `public/media/audio/3.mpga` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template audio loaded through AppConfig.assetUrl. |
| `public/media/audio/4.mpga` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template audio loaded through AppConfig.assetUrl. |
| `public/media/audio/5.mp3` | public runtime | src: src/components/DonateEvent.tsx, src/components/PageChannel.tsx<br>fixtures: src/dev/fixtures/main-donate-html-message.json, src/dev/fixtures/main-donate-prepare.json, src/dev/fixtures/main-donate-without-audio-url.json<br>docs: ASSET_AUDIT_2026.md | used | keep | Donate template audio loaded through AppConfig.assetUrl. |
| `public/media/audio/6.mpga` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template audio loaded through AppConfig.assetUrl. |
| `public/media/audio/7.mp3` | public runtime | src: src/components/DonateEvent.tsx, src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Donate template audio loaded through AppConfig.assetUrl. |
| `public/media/gif/1.gif` | public runtime | src: src/components/DonateEvent.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Donate template GIF loaded through AppConfig.assetUrl. |
| `public/media/gif/2.gif` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template GIF loaded through AppConfig.assetUrl. |
| `public/media/gif/3.gif` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template GIF loaded through AppConfig.assetUrl. |
| `public/media/gif/4.gif` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template GIF loaded through AppConfig.assetUrl. |
| `public/media/gif/5.gif` | public runtime | src: src/components/DonateEvent.tsx | used | keep | Donate template GIF loaded through AppConfig.assetUrl. |
| `public/media/gif/6.gif` | public runtime | src: src/components/DonateEvent.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Donate template GIF loaded through AppConfig.assetUrl. |
| `public/media/gif/7.gif` | public runtime | src: src/components/DonateEvent.tsx<br>docs: ASSET_AUDIT_2026.md | used | keep | Donate template GIF loaded through AppConfig.assetUrl. |
| `public/robots.txt` | public static file | none found | used | keep | Vite copies public root files to output; harmless deploy metadata. |
| `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.eot` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.svg` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.ttf` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.woff` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.woff2` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.eot` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.svg` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.ttf` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.woff` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.woff2` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.eot` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.svg` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.ttf` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.woff` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.woff2` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.eot` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.svg` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.ttf` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.woff` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.woff2` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.eot` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.svg` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.ttf` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.woff` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.woff2` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.eot` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.svg` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.ttf` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.woff` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.woff2` | unknown / suspicious legacy font | none found | suspicious | delete only after visual QA | No @font-face reference found in current SCSS; likely old donation template fonts. |
| `src/assets/fonts/pxiByp8kv8JHgFVrLCz7Z1JlFc-K.woff2` | unknown / suspicious local font | none found | suspicious | move later | Looks like local Poppins font files; currently Google Fonts is imported remotely instead. |
| `src/assets/fonts/pxiByp8kv8JHgFVrLDz8Z1JlFc-K.woff2` | unknown / suspicious local font | none found | suspicious | move later | Looks like local Poppins font files; currently Google Fonts is imported remotely instead. |
| `src/assets/fonts/pxiByp8kv8JHgFVrLEj6Z1JlFc-K.woff2` | unknown / suspicious local font | none found | suspicious | move later | Looks like local Poppins font files; currently Google Fonts is imported remotely instead. |
| `src/assets/fonts/pxiByp8kv8JHgFVrLGT9Z1JlFc-K.woff2` | unknown / suspicious local font | none found | suspicious | move later | Looks like local Poppins font files; currently Google Fonts is imported remotely instead. |
| `src/assets/fonts/pxiEyp8kv8JHgFVrJJnecmNE.woff2` | unknown / suspicious local font | none found | suspicious | move later | Looks like local Poppins font files; currently Google Fonts is imported remotely instead. |
| `src/assets/images/cat_surprised.gif` | static import asset | src: src/components/PageChannel.tsx<br>fixtures: src/dev/fixtures/main-coinflip-prepare.json, src/dev/fixtures/main-coinflip-started.json<br>docs: ASSET_AUDIT_2026.md | used | rename later | Imported by PageChannel as main alert intro/normal event images or referenced in fixtures. |
| `src/assets/images/money.png` | SCSS reference / src asset | SCSS/CSS: src/style/app.css, src/style/app.scss<br>docs: ASSET_AUDIT_2026.md | used | keep | Referenced from SCSS/CSS for donation visuals. |
| `src/assets/images/pobrane_1.png` | static import asset | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | rename later | Imported by PageChannel as main alert intro/normal event images or referenced in fixtures. |
| `src/assets/images/pobrane_2.png` | static import asset | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | rename later | Imported by PageChannel as main alert intro/normal event images or referenced in fixtures. |
| `src/assets/images/pobrane_3.png` | static import asset | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | rename later | Imported by PageChannel as main alert intro/normal event images or referenced in fixtures. |
| `src/assets/images/pobrane_5.png` | static import asset | src: src/components/PageChannel.tsx<br>docs: ASSET_AUDIT_2026.md | used | rename later | Imported by PageChannel as main alert intro/normal event images or referenced in fixtures. |
| `src/assets/images/pobrane_6.webp` | static import asset | src: src/components/PageChannel.tsx<br>fixtures: src/dev/fixtures/main-roulette-prepare.json<br>docs: ASSET_AUDIT_2026.md | used | rename later | Imported by PageChannel as main alert intro/normal event images or referenced in fixtures. |

## Asset families

### `public/assets/images/roulette/*`

Status: **probably used dynamically**. These files are referenced by roulette fixture/backend item filenames and loaded by `RouletteEvent` through `/assets/images/roulette/${item.image}`. They must stay in `public` unless the backend/fixture filename contract is migrated at the same time.

### `public/media/gif/*` and `public/media/audio/*`

Status: **used**. These are frontend-owned donate template media paths. They are stable runtime assets and should stay in `public` until a deliberate path migration is done. Template numbers 8-10 currently reuse tier-7 media rather than having unique `8.*`, `9.*`, `10.*` files.

### `src/assets/images/pobrane_*` and `src/assets/images/cat_surprised.gif`

Status: **used static imports**. These are bundled by Vite because `PageChannel` imports them directly for normal alert intro images. They should eventually be renamed to semantic names under `src/assets/ui/`, but not deleted.

### `src/assets/fonts/*`

Status: **suspicious**. Current SCSS imports Google Fonts remotely and no current `@font-face` declarations reference these local font files. The `pxi*.woff2` files look like local Poppins-like files and may be useful for a future self-hosting pass. The `src/assets/fonts/donations/*` files look like legacy donate template fonts. Do not delete before visual QA.

## External runtime dependencies

| Reference | Where found | Classification | Risk | Recommended action |
|---|---|---|---|---|
| Google Fonts import | `src/style/app.scss` | external URL asset | OBS can fail/flash/change if Google Fonts is blocked or slow | Replace later with local `@font-face` after matching font files. |
| Tipply/TTS URLs | donate fixtures, `resolveBackendAudioUrl.ts` | fixture/backend-driven dynamic URL | Acceptable for backend-provided TTS; network success must not be required | Keep dynamic; do not fake TTS as local production asset. |
| 7TV emote image URL | donate HTML message fixtures | fixture message content | Fixture realism only; should not be required for core overlay behavior | Keep as fixture-only or replace with local fixture media if deterministic screenshots are needed. |
| `seeklogo.com` coinflip image | old docs/audit only | resolved former external runtime asset | Resolved | Runtime SCSS now uses `public/assets/images/coinflip/head.png`. |
| `kajkowo.bdrewnowski.ovh` coinflip image | old docs/audit only | resolved former external runtime asset | Resolved | Runtime SCSS now uses `public/assets/images/coinflip/tail.png`. |

## Do not delete yet

These files are suspicious but risky to remove without visual QA or checking legacy OBS scenes/template history:

- `public/assets/images/donate/dcba4b98efb5425eb46114645dcf706bfbd7aad6.gif` - No current runtime reference found; likely old donation template media.
- `public/assets/sounds/assist/soundInit.mp3` - No current source reference found except docs/audit; may be legacy template or assist sound.
- `public/assets/sounds/donate/500b326786d86a9f10394cf0e7aa29d8706ed06e.mpga` - No current source reference found except docs/audit; may be legacy template or assist sound.
- `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.eot` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.svg` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.ttf` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.woff` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/1dcebf6071e7920b34b1b0a9f2872107.woff2` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.eot` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.svg` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.ttf` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.woff` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/2a16995f44a82489afe3375fd0554608.woff2` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.eot` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.svg` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.ttf` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.woff` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/5d726d565876da172810bea71e2ee3ad.woff2` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.eot` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.svg` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.ttf` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.woff` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/60c0d016ac4ba760aa725d7736afbfdf.woff2` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.eot` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.svg` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.ttf` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.woff` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/bcd61c67e09eb53ba095e6a3a4a199f2.woff2` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.eot` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.svg` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.ttf` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.woff` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/donations/d78ccdf8846108bd5886812b8e8c1c36.woff2` - No @font-face reference found in current SCSS; likely old donation template fonts.
- `src/assets/fonts/pxi*.woff2` - not currently referenced, but likely useful for replacing remote Google Fonts.

## Recommended cleanup order

1. Replace Google Fonts with verified local font files and compare screenshots.
2. Rename static UI imports in `src/assets/images/pobrane_*` to semantic names under `src/assets/ui/`, one commit only for imports/name changes.
3. Normalize donate media paths only with compatibility redirects or a full QA pass for every donate tier.
4. Normalize roulette reward image paths only if backend/fixture filename expectations are updated together.
5. Delete suspicious legacy media only after OBS visual QA and a grep proving no runtime path remains.

