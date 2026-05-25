# DEV fixture replay 2026

This repo is a legacy OBS overlay frontend. The old backend WebSocket contract remains the source of truth.
Fixture replay exists only to test existing legacy payload fixtures without running the old backend.

## Safety gate

Fixture replay runs only when one of these is true:

- `import.meta.env.DEV === true`
- `VITE_ENABLE_FIXTURE_REPLAY === "true"`

Do not enable `VITE_ENABLE_FIXTURE_REPLAY` in normal production deployments.

## Query parameter

Use the `fixture` query parameter:

```txt
/ALERTS/<uuid>?fixture=main-donate-prepare
/ALERTS/<uuid>?test=true&fixture=main-donate-prepare
/TIP_ALERT/<uuid>?fixture=main-donate-prepare
/REWARD_ALERT/<uuid>?fixture=main-roulette-started
/QUEUE/<uuid>?fixture=queue-set
/QUEUE/<uuid>?test=true&fixture=queue-set
/SUB_GOAL/<uuid>?fixture=subs-set
/SUB_GOAL/<uuid>?test=true&fixture=subs-set
/FOLLOW_GOAL/<uuid>?fixture=followers-set
/FOLLOW_GOAL/<uuid>?test=true&fixture=followers-set
```

Use explicit overlay routes only. Removed `/channel/*` and `/test/channel/*` routes should be used only as rejection checks.

## Available fixtures

Fixtures are registered in `src/dev/replay/fixtureIndex.ts` from `src/dev/fixtures`.

Current examples:

- `main-donate-prepare`
- `main-donate-without-audio-url`
- `main-donate-html-message`
- `main-alert-list-set`
- `main-roulette-prepare`
- `main-roulette-started`
- `main-coinflip-prepare`
- `main-coinflip-started`
- `queue-set`
- `queue-add`
- `queue-delete`
- `subs-set`
- `subs-update`
- `followers-set`
- `followers-update`

## Important rule

Fixture replay must call the same message handling methods as WebSocket messages.
It must not introduce a second event handling system, new payload shape, new route, or backend behavior.

## Donate fixture ownership

Donate fixtures replay backend WebSocket payloads only. They do not replay raw Tipply webhooks.

Production data flow is:

```txt
Tipply -> legacy backend -> WebSocket -> overlays-legacy frontend
```

That means donate fixtures must use the legacy frontend wrapper:

```json
{
  "event": "prepare",
  "key": "donate",
  "id": "...",
  "args": {
    "nickname": "Michaś",
    "amount": 300
  }
}
```

Remote TTS URLs in fixtures are allowed because they mirror backend-forwarded payloads, but network success is not required for fixture tests. Failed audio/TTS loading must be logged safely through `debugLog` and must not crash the overlay or create `Uncaught (in promise)` errors.

Template GIF/music/audio assets are frontend-owned and should load from `public/assets/donations/gif` and `public/assets/donations/audio` through the overlay asset URL resolvers. Fixture replay must not depend on old Tipply template media URLs. Backend-provided TTS may stay remote because it represents dynamic payload data, not frontend-owned template media.

Raw Tipply examples belong only in clearly labelled backend documentation, if needed, and must be described as upstream backend input, not frontend WebSocket payload.


## Fixture audio in browser preview

Browser dev mode may block autoplay until the page receives a user gesture. OBS Browser Source is expected to behave differently, but local browser preview needs a safe dev flow.

### Muted replay

For fixture replay only, audio can be skipped with:

```txt
/ALERTS/<uuid>?fixture=main-donate-prepare&muteAudio=true
/ALERTS/<uuid>?fixture=main-donate-prepare&muteAudio=1
```

Muted fixture audio is active only when a valid fixture replay is active and fixture replay is allowed by the dev safety gate. It does not affect normal routes without `fixture`, and it must not be enabled as a production behavior. When muted, overlay audio/TTS is skipped, logged through `debugLog`, and the event sequence continues safely. Muted replay starts immediately and does not require an unlock click.

Muted replay still simulates approximate audio duration so donate animation timing stays useful in browser preview. It does not call `audio.play()`, but template audio, nickname TTS, amount TTS and message TTS wait for small fixed delays before continuing.

For fast logic checks, skip both audio and simulated timing with:

```txt
/ALERTS/<uuid>?fixture=main-donate-prepare&muteAudio=true&fast=true
/ALERTS/<uuid>?fixture=main-donate-prepare&muteAudio=1&fast=1
```

### Audio unlock replay

When fixture replay is active and `muteAudio` is not enabled, the fixture does not start immediately in browser preview. A dev-only prompt is shown:

```txt
Click to start fixture preview with audio
```

Clicking the prompt unlocks browser audio and then starts fixture replay through the same `handleLegacyMessage(payload)` path used by WebSocket messages. This keeps donate timing closer to real OBS behavior because the actual local template audio and backend/Tipply TTS URLs are attempted after a user gesture.



## Invalid route and account behavior

Fixture replay is independent from legacy backend account existence. A valid fixture route should not open the legacy backend WebSocket.

Malformed UUID routes, such as `/TIP_ALERT/not-a-uuid`, should render `Overlay not found` because they fail route syntax validation. Removed `/channel/*` routes should also render `Overlay not found`.

Valid-format UUIDs that do not exist on the backend are different. They are valid routes but unavailable overlays. In normal backend mode the overlay may retry the WebSocket a few times and then render `Overlay unavailable` instead of reconnecting forever.

## Manual checks

Run dev server:

```bash
pnpm run dev
```

Open these URLs:

```txt
/ALERTS/test-account?fixture=main-donate-prepare&muteAudio=true
/ALERTS/test-account?fixture=main-donate-prepare
/QUEUE/test-account?fixture=queue-set
/SUB_GOAL/test-account?fixture=subs-set
/FOLLOW_GOAL/test-account?fixture=followers-set
/TIP_ALERT/test-account?fixture=main-donate-prepare&muteAudio=true
/TIP_ALERT/test-account?fixture=main-donate-prepare&muteAudio=true&fast=true
```

For real route validation, use a valid UUID instead of `test-account`; invalid UUIDs should show the minimal `Overlay not found` screen.

Then repeat against the real backend without the `fixture` query parameter to confirm legacy WebSocket behavior still works.

## Backend connection safety

When a known fixture name is active through `?fixture=<fixture-name>` and fixture replay is enabled, the main overlay route skips opening the legacy backend WebSocket. The fixture is passed into the same `handleLegacyMessage(payload)` path used by `ws.onmessage`, so replay does not create a parallel event system.
