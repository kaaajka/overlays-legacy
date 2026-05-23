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
/channel/<uuid>?fixture=main-donate-prepare
/channel/<uuid>/queue?fixture=queue-set
/channel/<uuid>/subs?fixture=subs-set
/channel/<uuid>/followers?fixture=followers-set
```

## Available fixtures

Fixtures are registered in `src/dev/replay/fixtureIndex.ts` from `src/dev/fixtures`.

Current examples:

- `main-donate-prepare`
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

## Manual checks

Run dev server:

```bash
pnpm run dev
```

Open these URLs:

```txt
/channel/test-account?fixture=main-donate-prepare
/channel/test-account/queue?fixture=queue-set
/channel/test-account/subs?fixture=subs-set
/channel/test-account/followers?fixture=followers-set
```

Then repeat against the real backend without the `fixture` query parameter to confirm legacy WebSocket behavior still works.

## Backend connection safety

When a known fixture name is active through `?fixture=<fixture-name>` and fixture replay is enabled, the main overlay route skips opening the legacy backend WebSocket. The fixture is passed into the same `handleLegacyMessage(payload)` path used by `ws.onmessage`, so replay does not create a parallel event system.
