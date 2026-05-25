# Dependency and Tooling Audit 2026

Date: 2026-05-23  
Repository: `overlays-legacy`  
Scope: dependency and tooling audit only. No runtime behavior was changed.

## Executive summary

The project is now in a much better state than a raw legacy overlay dump: runtime routing no longer depends on React Router, fixture replay exists, protocol guards are tested, and the smaller overlay sockets plus the main alert overlay use a shared WebSocket lifecycle helper.

The current dependency list is small and mostly justified. The only suspicious items are not runtime libraries, but tooling and generated/source hygiene:

- `prettier` is installed but there is no `format` or `format:check` script.
- There is no `typecheck` script even though validation repeatedly requires `pnpm exec tsc --noEmit`.
- `README_DEPLOY_2026.md` still says Node `22.x`, while `package.json` now declares Node `24.x`.
- `src/style/app.css` and `src/style/app.css.map` look like generated Sass output committed next to `src/style/app.scss`. Runtime imports `app.scss`, not `app.css`.
- `src/style/app.scss` still contains external runtime URLs for Google Fonts and two image assets. This is not dependency-manager debt, but it is deployment/OBS reliability debt.

Do not upgrade React or MobX yet. That would be a high-risk project, not cleanup.

## Files inspected

- `package.json`
- `pnpm-lock.yaml`
- `vite.config.ts`
- `tsconfig.json`
- `.npmrc`
- `README_DEPLOY_2026.md`
- source imports under `src/`
- public/static assets under `public/`

## Current package list

### Runtime dependencies

| Package | Status | Evidence | Risk if removed | Notes |
|---|---:|---|---:|---|
| `react` | Used | Imported by `src/index.tsx` and component files such as `DonateEvent.tsx`, `PageChannel.tsx`, `Goal.tsx`, `NotFound.tsx` | Critical | Keep. Project is React 17 legacy runtime. |
| `react-dom` | Used | Imported by `src/index.tsx` as `ReactDOM` | Critical | Keep. Required to mount the overlay app. |
| `mobx` | Used | Imported in `PageChannel.tsx`, queue/subs/followers components, event components and models | Critical | Keep. Current class-component state model depends on MobX decorators/observables/reactions. |
| `mobx-react` | Used | Imported as `observer` in overlay components | Critical | Keep. Do not remove before a deliberate state/render migration. |

### Development dependencies

| Package | Status | Evidence | Risk if removed | Notes |
|---|---:|---|---:|---|
| `vite` | Used | `vite.config.ts`; scripts `dev`, `build`, `preview` | Critical | Keep. This is the build/dev server. |
| `@vitejs/plugin-react` | Used | Imported in `vite.config.ts` | Critical | Keep. Needed for React transform. |
| `@babel/plugin-proposal-decorators` | Used | Configured in `vite.config.ts` under React plugin Babel config | Critical | Keep while MobX decorators/legacy decorator syntax remain. |
| `typescript` | Used | `tsconfig.json`; validation command `pnpm exec tsc --noEmit` | Critical | Keep. |
| `vitest` | Used | Imported in test files under `src/**/*.test.ts`; scripts `test`, `test:watch` | Critical | Keep. |
| `sass` | Used | `src/components/PageChannel.tsx` imports `../style/app.scss` | Critical | Keep while SCSS is imported directly. |
| `prettier` | Installed, script missing | Present in `package.json`; no `format` / `format:check` scripts | Low | Keep for now, but add scripts before arguing about Biome. |
| `@types/react` | Used | Required for TS/React 17 typings | Critical | Keep. |
| `@types/react-dom` | Used | Required for `ReactDOM.render` typings | Critical | Keep. |
| `@types/node` | Used indirectly | Needed by Vite/Vitest/tooling and TS environment | Medium | Keep. Removing is not worth it. |

## Packages that appear removed correctly

`react-router-dom` and `@types/react-router-dom` are no longer present in `package.json`, `pnpm-lock.yaml`, or `src/` imports. Runtime routing is now resolved by `src/routing/parseOverlayRoute.ts` in `src/index.tsx`.

Evidence checked:

```bash
grep -R "react-router-dom\|RouteComponentProps" -n src package.json pnpm-lock.yaml
grep -R "react-router" -n src package.json pnpm-lock.yaml
```

Result during audit: no remaining source/package/lock references.

## Used import evidence

Relevant direct imports found in `src/` and config:

```txt
mobx       -> 11 source files
mobx-react -> 9 source files
react      -> 22 source files
react-dom  -> src/index.tsx
vitest     -> 5 test files
vite       -> vite.config.ts
@vitejs/plugin-react -> vite.config.ts
```

The dependency graph is small. There is no obvious runtime library to remove safely right now.

## Suspicious or cleanup candidates

### 1. `src/style/app.css` and `src/style/app.css.map`

Status: suspicious generated files.  
Evidence: runtime imports `../style/app.scss` from `src/components/PageChannel.tsx`. There was no source import of `src/style/app.css` found.

Risk of removal: medium-low, but do not remove in this audit commit.  
Why not now: CSS can be referenced by tooling, docs, or human workflow outside TS import search. Remove only in a dedicated cleanup commit after checking local dev and production build.

Recommended next action:

```bash
grep -R "style/app.css\|app.css.map" -n . --exclude-dir=node_modules --exclude-dir=dist
```

If only the files themselves reference the map, remove both in a tiny commit.

### 2. External CSS/font import

`src/style/app.scss` contains:

```scss
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&family=Permanent+Marker&display=swap');
```

Status: runtime external dependency.  
Risk: medium for OBS reliability, because font loading depends on network and CSP/deployment environment.

The previous unreferenced local font files under `src/assets/fonts` were removed during the asset architecture cleanup. A future self-hosted font pass should add explicitly verified font files and `@font-face` declarations if visual parity is acceptable.

Do not do this casually. Font changes can shift overlay layout and break OBS composition.

### 3. External image URLs in SCSS

The previous coinflip SCSS image URLs from `seeklogo.com` and `kajkowo.bdrewnowski.ovh` were localized. Current coinflip SCSS should resolve local public assets under:

```txt
public/assets/images/coinflip/head.png
public/assets/images/coinflip/tail.png
```

Status: resolved for coinflip images.  
Risk: low, assuming the public assets are deployed with the overlay bundle.

One of these appears to have a local equivalent:

```txt
public/assets/images/subs/miecioch.png
```

Recommended future action:

- Replace the `kajkowo.../miecioch.png` URL with a local `AppConfig.assetUrl` equivalent or CSS-safe local public path.
- Download or replace the eagle/orzel image with a local asset if that visual is still required.
- Test the coinflip visual in OBS after the change.

### 4. `prettier` without scripts

Status: tooling incomplete.  
Risk: low.

Prettier is present, but `package.json` has no formatting scripts. That means the dependency exists without a standard team command.

Recommended future scripts:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

Do not add Biome until this basic Prettier workflow is settled.

### 5. Missing `typecheck` script

Status: tooling gap.  
Risk: low.

Validation repeatedly requires:

```bash
pnpm exec tsc --noEmit
```

Recommended future script:

```json
"typecheck": "tsc --noEmit"
```

Then standard validation becomes:

```bash
pnpm test
pnpm run build
pnpm run typecheck
```

### 6. Node version inconsistency

`package.json` says:

```json
"engines": {
  "node": "24.x"
}
```

But `README_DEPLOY_2026.md` still says:

```txt
The package currently pins Node to 22.x for stable legacy deployment.
```

Status: documentation inconsistency.  
Risk: medium, because Vercel/Netlify/CI setup may follow docs instead of package metadata.

Recommended next action: decide and document one policy.

Given the current project direction says Node 24.x LTS target, the likely cleanup is to update `README_DEPLOY_2026.md` and any stale audit docs from `22.x` to `24.x`. Do it in a docs-only commit.

### 7. `.npmrc` peer settings

Current `.npmrc`:

```txt
legacy-peer-deps=true
strict-peer-dependencies=false
auto-install-peers=true
fund=false
audit=false
```

Status: intentionally permissive.  
Risk: low-medium.

This is probably legacy safety for old React/MobX peer dependency combinations and prior npm/Vercel weirdness. Do not tighten it until CI install is stable with frozen lockfile.

## CDN/runtime external assets

### Should remain dynamic

These should not be localized as frontend assets:

- backend-provided TTS URLs in donate payloads
- Tipply-derived TTS fields such as `tts_nickname_google_male`, `tts_message_google_male`, `tts_amount_google_male`
- fixture remote TTS examples, as long as tests do not require network success
- HTML donate message emote URLs such as `cdn.7tv.app`, because they represent backend-forwarded message content

### Should be local or audited for localization

These are frontend-owned presentation assets or style dependencies and should not rely on third-party runtime availability if we want OBS-grade reliability:

- Google Fonts import in `src/style/app.scss`
- Google Fonts import in `src/style/app.scss`

Donate template GIF/audio is local under:

```txt
public/assets/donations/gif/
public/assets/donations/audio/
```

Reward images and sounds are local under:

```txt
public/assets/images/rewards/
public/assets/sounds/rewards/
public/assets/sounds/shared/
```

Coinflip images are local under:

```txt
public/assets/images/coinflip/
```

## Is Prettier enough, or should we add Biome?

Prettier is enough for the next cleanup step.

Do not add Biome yet.

Why:

- The project is legacy React 17 + class components + MobX decorators.
- There is already a fragile build/test/deploy history.
- Biome would add a new policy surface and likely produce a huge formatting/lint diff.
- The current problem is not lack of a linter; it is source hygiene, route/socket stability, and OBS runtime reliability.

Recommended sequence:

1. Add `format` and `format:check` scripts for existing Prettier.
2. Run `format:check` in CI/manual validation.
3. Only after that, consider Biome in a separate branch with `biome check` in non-writing mode first.
4. Do not auto-format the whole repo until the OBS overlay visuals have been manually checked.

## Build and test scripts

Current scripts:

```json
{
  "dev": "vite",
  "start": "vite",
  "build": "vite build",
  "build:test": "vite build --mode test --base=/test/",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Missing but recommended:

```json
"typecheck": "tsc --noEmit",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

Optional later, after external asset cleanup:

```json
"check": "pnpm test && pnpm run build && pnpm run typecheck && pnpm run format:check"
```

Do not add this until each individual command is stable locally and in deploy environment.

## package.json accuracy after React Router removal

`package.json` is mostly accurate after removing React Router:

- Runtime dependencies are all used.
- React Router is absent.
- Test scripts exist.
- `packageManager` is pinned to `pnpm@10.17.1`.
- `engines.node` says `24.x`.

The main accuracy issue is not package dependencies; it is Node policy mismatch between `package.json` and `README_DEPLOY_2026.md`.

## pnpm lockfile health

Observed:

- `lockfileVersion: '9.0'`
- importer dependencies match current `package.json`.
- no `react-router` references found.
- lockfile parses as YAML.
- versions currently resolved include:
  - `react@17.0.2`
  - `react-dom@17.0.2`
  - `mobx@6.15.3`
  - `mobx-react@7.6.0`
  - `vite@7.3.3`
  - `vitest@4.1.7`
  - `typescript@5.9.3`

Risk: medium only because this audit environment could not run `pnpm install --frozen-lockfile`. Locally, validate with:

```bash
corepack prepare pnpm@10.17.1 --activate
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm exec tsc --noEmit
```

## Safe cleanup order

### Step 1 - Add missing scripts

Add:

```json
"typecheck": "tsc --noEmit",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

Risk: low.  
Runtime impact: none.

### Step 2 - Fix Node version docs

Make `README_DEPLOY_2026.md`, old audit docs and `package.json` agree on Node 24.x or deliberately revert package metadata to 22.x.

Risk: low-medium.  
Runtime impact: none if docs only.

### Step 3 - Remove generated CSS artifacts if confirmed unused

Candidate files:

```txt
src/style/app.css
src/style/app.css.map
```

Risk: medium-low.  
Runtime impact: should be none if no imports exist, but verify build and visual overlay preview.

### Step 4 - Localize remaining SCSS external images

Replace external image URLs in `src/style/app.scss` with local public assets.

Risk: medium.  
Runtime impact: visual, especially coinflip.

### Step 5 - Localize Google Fonts or accept the external dependency deliberately

Replace Google Fonts import with local `@font-face` only after visual comparison.

Risk: medium-high.  
Runtime impact: text layout and OBS visual composition.

### Step 6 - Consider Biome only after the above

Start with non-mutating check. Do not auto-format the whole repo in the same commit as tooling adoption.

Risk: medium.  
Runtime impact: none directly, but high review noise.

## Do not do yet

Do not do these as cleanup chores:

- Do not upgrade React 17 to React 18/19 yet.
- Do not replace MobX yet.
- Do not remove decorators yet.
- Do not migrate class components to hooks yet.
- Do not change donation lifecycle while cleaning dependencies.
- Do not merge style asset localization with socket/routing changes.
- Do not add Biome and reformat everything in one PR.
- Do not remove `.npmrc` peer settings until frozen install is proven stable.

## Validation for this audit commit

This commit adds documentation only. The intended validation remains:

```bash
pnpm install
pnpm test
pnpm run build
pnpm exec tsc --noEmit
```

In this execution environment, `pnpm` was not available, so validation must be run locally.
