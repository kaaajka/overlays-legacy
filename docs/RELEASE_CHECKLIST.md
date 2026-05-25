# Overlays legacy release checklist

## Purpose

Use this checklist before shipping or deploying `overlays-legacy`.

`overlays-legacy` is a stabilized legacy OBS frontend. The release goal is not to redesign it. The release goal is to prove that existing OBS routes, visuals, audio behavior, WebSocket behavior and deploy settings still work.

Do not ship a release that only “looks fine in the browser”. OBS Browser Source behavior can differ from a normal browser, especially for audio, caching, transparency and source refresh.

## 1. Build checks

Run these checks from a clean working tree before release.

### Runtime

- [ ] Node.js is `24.x` / Node.js 24 LTS.

  ```bash
  node -v
  ```

- [ ] pnpm is `10.17.1`.

  ```bash
  pnpm -v
  ```

- [ ] Dependencies install from the lockfile.

  ```bash
  pnpm install --frozen-lockfile
  ```

### Required validation commands

- [ ] Lint passes.

  ```bash
  pnpm lint
  ```

- [ ] Typecheck passes.

  ```bash
  pnpm typecheck
  ```

- [ ] Tests pass.

  ```bash
  pnpm test
  ```

- [ ] Production build passes.

  ```bash
  pnpm build
  ```

Do not ignore one failed check because “it is only legacy”. That is exactly how legacy turns into production trash.

## 2. Manual fixture and OBS checks

Run these checks in a browser and in OBS Browser Source after deployment or before cutting a release archive.

Recommended OBS Browser Source baseline:

- [ ] Width: `1920`
- [ ] Height: `1080`
- [ ] Transparent background works.
- [ ] Audio playback works inside OBS, not only in a normal browser.
- [ ] Refresh behavior is verified for scene switching and stale state.

### Main alert overlay

Check the main alert route, preferably through both the legacy route and current alias if used by operators:

- [ ] `/` renders the Home/link generator.
- [ ] `/ALERTS/:uuid`

Required event checks:

- [ ] Donation prepare renders the expected template.
- [ ] Donation with HTML message renders message content as current legacy behavior expects.
- [ ] Donation with missing audio does not block the queue forever.
- [ ] Roulette prepare renders correctly.
- [ ] Roulette started renders correctly.
- [ ] Coinflip prepare renders correctly.
- [ ] Coinflip started renders correctly.
- [ ] Dogs reward renders correctly.
- [ ] Mute reward renders correctly.
- [ ] Censure reward renders correctly.
- [ ] Without R reward renders correctly.
- [ ] WebSocket reconnect works after backend restart or network interruption.
- [ ] Overlay unavailable state is visible or handled as expected when the backend is unavailable.
- [ ] Audio playback in OBS is audible and controllable according to Browser Source settings.

### Follower goal overlay

Check:

- [ ] `/FOLLOW_GOAL/:uuid`

Required event checks:

- [ ] Follower goal initial set renders correctly.
- [ ] Follower goal update changes progress correctly.
- [ ] Canvas stays transparent.
- [ ] Browser Source size is `1920x1080` unless the OBS scene intentionally uses another canvas size.
- [ ] Refresh/reload does not leave stale progress from a previous test.

### Sub goal overlay

Check:

- [ ] `/SUB_GOAL/:uuid`

Required event checks:

- [ ] Sub goal initial set renders correctly.
- [ ] Sub goal update changes progress correctly.
- [ ] Canvas stays transparent.
- [ ] Browser Source size is `1920x1080` unless the OBS scene intentionally uses another canvas size.
- [ ] Refresh/reload does not leave stale progress from a previous test.

### Queue overlay

Check:

- [ ] `/QUEUE/:uuid`

Required event checks:

- [ ] Queue initial set renders correctly.
- [ ] Queue add renders the new item correctly.
- [ ] Queue delete removes the expected item.
- [ ] Queue does not visually corrupt after reconnect.
- [ ] Queue source keeps transparent background.

## 3. Production checks

Before deploy/release, verify the production configuration.

### Environment and deploy

- [ ] `VITE_WS_URL` points to the correct production legacy backend WebSocket base URL.
- [ ] The deploy output directory is correct: `dist`.
- [ ] The deploy provider uses Node.js 24 LTS.
- [ ] The deploy provider uses pnpm `10.17.1` through Corepack / package manager pinning.
- [ ] Production build output is generated from the current commit, not from an old local `dist`.

### Debug and logs

- [ ] No public debug logs are visible unless debug mode is explicitly enabled.
- [ ] Fixture/replay/debug-only behavior is not accidentally enabled for normal production users.
- [ ] Console output does not leak account identifiers beyond what the legacy model already exposes.

### Secrets and release package

- [ ] No secrets are committed to the repository.
- [ ] `.env` and `.env.local` are not committed.
- [ ] Release ZIP does not include `node_modules` unless explicitly required for a special offline handoff.
- [ ] Release ZIP does not include `dist` unless explicitly required as a prebuilt artifact.
- [ ] Release ZIP does not include `.vite` cache.
- [ ] Release ZIP does not include local logs or OS junk files.

Useful checks:

```bash
git status --short
git ls-files .env .env.local node_modules dist .vite "*.log" .DS_Store
```

If generated files are tracked, remove them from Git index without deleting local copies unless there is a specific reason to delete them:

```bash
git rm -r --cached node_modules dist .vite
git rm --cached .env .env.local "*.log" .DS_Store
```

## 4. Route compatibility checks

Existing OBS scenes must not break.

- [ ] Removed route is rejected: `/channel/:uuid`.
- [ ] Removed route is rejected: `/channel/:uuid/subs`.
- [ ] Removed route is rejected: `/channel/:uuid/followers`.
- [ ] Removed route is rejected: `/channel/:uuid/queue`.
- [ ] Removed test route is rejected: `/test/channel/:uuid`.
- [ ] Runtime test mode works through `?test=true` on explicit routes.
- [ ] Modern aliases, if used, are verified as naming aliases only.
- [ ] Modern aliases still use the legacy account UUID WebSocket model.

Do not claim that route aliases provide overlay-token security. They do not.

## 5. Release decision

Release only when all required checks are marked.

Minimum release gate:

- [ ] Build checks pass.
- [ ] Manual fixture/OBS checks pass for changed areas.
- [ ] Main alert overlay works in OBS.
- [ ] Goal overlays work in OBS.
- [ ] Queue overlay works in OBS.
- [ ] Production `VITE_WS_URL` is correct.
- [ ] No secrets or generated artifacts are included accidentally.

If a check is skipped, write down why. If the reason is “probably fine”, the reason is garbage and the release should wait.
