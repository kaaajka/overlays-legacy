# OBS setup final guide

## 1. Purpose

This is the operator-facing setup guide for adding `overlays-legacy` browser overlays to OBS.

`overlays-legacy` is a stabilized legacy OBS frontend. It is meant to preserve the existing visual behavior, audio behavior, route compatibility and legacy WebSocket runtime behavior. It is not the target future overlay platform.

Do not treat this guide as a redesign plan. Treat it as the stable setup contract for the current legacy overlays.

## 2. Required runtime and deploy assumption

The deployed frontend should be built and served with the repository runtime contract:

```txt
Node.js 24 LTS
pnpm 10.17.1
```

Expected production build:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The deployed app must receive the correct `VITE_WS_URL` for the legacy backend WebSocket base URL. The overlay account identifier in the browser source URL is still passed to the backend as `?account=:uuid`.

## 3. Available overlay routes

Use a real account UUID in place of `:uuid`.

### Legacy routes

| OBS overlay | Route | Backend WebSocket shape |
| --- | --- | --- |
| Main alert overlay | `/ALERTS/:uuid` | `VITE_WS_URL?account=:uuid` |
| Subscriber goal | `/SUB_GOAL/:uuid` | `VITE_WS_URL/subs?account=:uuid` |
| Follower goal | `/FOLLOW_GOAL/:uuid` | `VITE_WS_URL/followers?account=:uuid` |
| Queue | `/QUEUE/:uuid` | `VITE_WS_URL/queue?account=:uuid` |

### Modern naming aliases currently present

| OBS overlay | Alias route | Backend WebSocket shape |
| --- | --- | --- |
| All alerts/main overlay | `/ALERTS/:uuid` | `VITE_WS_URL?account=:uuid` |
| Donation/tip alerts | `/TIP_ALERT/:uuid` | `VITE_WS_URL?account=:uuid` |
| Reward alerts | `/REWARD_ALERT/:uuid` | `VITE_WS_URL?account=:uuid` |
| Subscriber goal | `/SUB_GOAL/:uuid` | `VITE_WS_URL/subs?account=:uuid` |
| Follower goal | `/FOLLOW_GOAL/:uuid` | `VITE_WS_URL/followers?account=:uuid` |
| Queue | `/QUEUE/:uuid` | `VITE_WS_URL/queue?account=:uuid` |

## 4. Critical route warning

The modern route aliases are naming aliases only.

They do not create a new backend protocol, a new authentication model, new WebSocket endpoints or a new dashboard token model. They still use the legacy account UUID WebSocket model and still pass the route UUID to the backend as `?account=:uuid`.

Do not tell operators that `/ALERTS/:uuid`, `/TIP_ALERT/:uuid`, `/REWARD_ALERT/:uuid`, `/SUB_GOAL/:uuid`, `/FOLLOW_GOAL/:uuid` or `/QUEUE/:uuid` are a new secure overlay-token system. They are not. That would be bullshit and would create a false security assumption.

## 5. Recommended OBS Browser Source settings

For each overlay, add a new OBS Browser Source.

Recommended settings:

| Setting | Recommended value |
| --- | --- |
| Width | `1920` |
| Height | `1080` |
| Custom frame rate | leave default unless the scene needs a specific FPS |
| Shutdown source when not visible | enabled when the overlay should fully reset while hidden |
| Refresh browser when scene becomes active | enabled for event overlays if stale state is a problem |
| Control audio via OBS | enabled for donation/audio overlays when OBS should expose the overlay as an audio source |
| Custom CSS | leave empty unless there is a documented operator-specific reason |

Background notes:

- The overlay page is designed to render with transparent areas. In OBS, keep the Browser Source background transparent. Do not add a color background in OBS unless the scene intentionally needs it.
- For donation/TTS audio, use `Control audio via OBS` if the operator wants separate volume control, monitoring and mute control inside OBS.
- If audio is handled by the browser source, test it in OBS, not only in a normal browser. Browser autoplay rules and OBS Browser Source behavior can differ.
- For full-scene overlays, keep the source at `1920x1080` and scale the source only if the OBS canvas is not 1080p.

## 6. How to add each overlay

Replace `https://overlay.example.com` and `:uuid` with the real deployed frontend origin and account UUID.

### Main all-alerts overlay

Recommended alias for new OBS sources:

```txt
https://overlay.example.com/ALERTS/:uuid
```

Legacy route that must keep working for existing scenes:

```txt
https://overlay.example.com/ALERTS/:uuid
```

Expected content includes donation alerts, rewards, roulette, coinflip and other main overlay events according to the legacy backend payloads.

### Donation/tip-only overlay

```txt
https://overlay.example.com/TIP_ALERT/:uuid
```

Expected content: donation/tip events only.

### Reward-only overlay

```txt
https://overlay.example.com/REWARD_ALERT/:uuid
```

Expected content: reward-like events such as roulette and coinflip according to the current frontend filtering behavior.

### Subscriber goal overlay

Recommended alias:

```txt
https://overlay.example.com/SUB_GOAL/:uuid
```

Legacy route:

```txt
https://overlay.example.com/SUB_GOAL/:uuid
```

### Follower goal overlay

Recommended alias:

```txt
https://overlay.example.com/FOLLOW_GOAL/:uuid
```

Legacy route:

```txt
https://overlay.example.com/FOLLOW_GOAL/:uuid
```

### Queue overlay

Recommended alias:

```txt
https://overlay.example.com/QUEUE/:uuid
```

Legacy route:

```txt
https://overlay.example.com/QUEUE/:uuid
```

## 7. How to test overlays

Run browser/OBS checks after deployment and after any runtime or visual change.

Use fixture replay only in development or when explicitly enabled for a test deployment. Do not enable fixture replay as normal production behavior.

### Donation

Check:

- donation template appears,
- selected donation template matches the current amount threshold behavior,
- template sound plays first,
- TTS nickname plays after template sound,
- TTS amount plays after nickname,
- TTS message plays after amount,
- missing TTS URLs do not block the sequence,
- broken audio does not hang the overlay forever,
- event finishes and the next queued alert can start.

Useful fixture example:

```txt
/ALERTS/:uuid?fixture=main-donate-prepare&muteAudio=true
/TIP_ALERT/:uuid?fixture=main-donate-prepare&muteAudio=true
```

For real audio preview in browser dev mode, remove `muteAudio=true` and use the dev audio unlock prompt if shown.

### Reward

Check reward-like events on the reward route and the all-alerts route:

```txt
/REWARD_ALERT/:uuid?fixture=main-roulette-started&muteAudio=true
/REWARD_ALERT/:uuid?fixture=main-coinflip-started&muteAudio=true
/ALERTS/:uuid?fixture=main-roulette-started&muteAudio=true
/ALERTS/:uuid?fixture=main-coinflip-started&muteAudio=true
```

Expected: reward route accepts reward-like events and ignores donation-only behavior.

### Roulette

Check:

- roulette event renders,
- item list/chances render as before,
- started/update/finished payloads do not crash the overlay,
- reward route and all-alerts route behave according to the current filtering rules.

Fixtures:

```txt
main-roulette-prepare
main-roulette-started
```

### Coinflip

Check:

- coinflip event renders,
- started event renders without layout regression,
- all-alerts route and reward route behave according to current filtering rules.

Fixture:

```txt
main-coinflip-started
```

### Followers goal

Check both route styles:

```txt
/FOLLOW_GOAL/:uuid?fixture=followers-set
/FOLLOW_GOAL/:uuid?fixture=followers-set
```

Expected:

- follower goal image loads,
- canvas progress draws,
- current/goal values match the payload,
- no canvas error appears when the overlay initializes or refreshes.

### Subs goal

Check both route styles:

```txt
/SUB_GOAL/:uuid?fixture=subs-set
/SUB_GOAL/:uuid?fixture=subs-set
```

Expected:

- subscriber goal image loads,
- canvas progress draws,
- current/goal values match the payload,
- no canvas error appears when the overlay initializes or refreshes.

### Queue

Check both route styles:

```txt
/QUEUE/:uuid?fixture=queue-set
/QUEUE/:uuid?fixture=queue-set
```

Expected:

- queue renders waiting items,
- the active item at `queue[0]` is intentionally not shown in the waiting list,
- add/delete fixture payloads update the visible list without crashing.

Fixtures:

```txt
queue-set
queue-add
queue-delete
```

## 8. Troubleshooting

### No overlay appears

Check:

- the Browser Source URL is correct,
- the UUID is present and valid,
- the route exists,
- the deployed frontend is reachable over HTTPS,
- OBS is not showing an old cached error page,
- the browser source width/height is `1920x1080`,
- the overlay is above the scene content in the OBS source stack.

If an invalid route or malformed UUID is used, the frontend may render `Overlay not found`.

### No WebSocket connection

Check:

- `VITE_WS_URL` is configured in the deploy environment,
- the backend WebSocket server is reachable,
- the backend accepts the `?account=:uuid` value,
- the frontend route maps to the expected channel:
  - main: `VITE_WS_URL?account=:uuid`,
  - subs: `VITE_WS_URL/subs?account=:uuid`,
  - followers: `VITE_WS_URL/followers?account=:uuid`,
  - queue: `VITE_WS_URL/queue?account=:uuid`,
- browser devtools/OBS logs do not show mixed-content or TLS errors,
- the UUID belongs to a configured backend channel.

Do not “fix” this by changing frontend route names or WebSocket protocol without a documented backend contract change.

### No audio

Check:

- OBS Browser Source has audio enabled,
- `Control audio via OBS` is enabled if operator-level audio control is required,
- OBS mixer is not muted,
- desktop monitoring/output settings are correct,
- the donation payload contains valid TTS URLs if TTS is expected,
- frontend-owned template audio files are deployed under the expected `public/assets/donations/audio` paths,
- browser preview is not blocked by autoplay policy.

OBS Browser Source can behave differently from normal Chrome/Edge preview. Test final audio inside OBS.

### Wrong size or cropped overlay

Check:

- Browser Source width is `1920`,
- Browser Source height is `1080`,
- source transform is reset or intentionally scaled,
- OBS canvas/base resolution matches the intended stream layout,
- no custom CSS is overriding layout,
- the source is not clipped by a group or scene transform.

### Stale cached overlay

Check:

- right-click Browser Source and use refresh/reload,
- enable `Refresh browser when scene becomes active` for overlays that stale often,
- clear OBS browser cache if a deploy changed but OBS still serves old assets,
- add a temporary cache-busting query only for debugging, for example `?v=manual-test-1`,
- make sure the deployed build actually contains the newest `dist` output.

Do not leave random cache-busting parameters as undocumented production behavior.

## 9. Release checklist reference

Before releasing changes that can affect OBS runtime or visuals, run the repository validation commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Then run manual OBS/browser-source QA using:

- `OBS_OVERLAY_QA_2026.md` for the full route and fixture matrix,
- `DEV_REPLAY_2026.md` for fixture replay details,
- `BACKEND_CONTRACT_SNAPSHOT_2026.md` for the current backend WebSocket contract,
- `docs/LEGACY_FRONTEND_POLICY_2026.md` for the stabilization rules.

A release is not ready if it changes visual/runtime behavior without OBS or fixture replay verification.
