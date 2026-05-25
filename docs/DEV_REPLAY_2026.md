# Dev replay 2026

Fixture replay is a development-only helper for manually checking legacy OBS overlay visuals and payload handling.

Overlay URLs should not be shown publicly.

## Active replay routes

Use a valid account UUID in place of `<uuid>`.

```txt
/ALERTS/<uuid>?fixture=main-donate-prepare
/TIP_ALERT/<uuid>?fixture=main-donate-prepare
/REWARD_ALERT/<uuid>?fixture=main-roulette-started
/QUEUE/<uuid>?fixture=queue-set
/SUB_GOAL/<uuid>?fixture=subs-set
/FOLLOW_GOAL/<uuid>?fixture=followers-set
```

`/` renders the Home/link generator page and is useful for generating normal and test overlay URLs.

Removed historical routes are not supported for replay:

```txt
/channel/*
/test/channel/*
```

## Runtime test mode

Append `?test=true` to any explicit overlay route to enable runtime test mode:

```txt
/ALERTS/<uuid>?test=true
/TIP_ALERT/<uuid>?test=true
/REWARD_ALERT/<uuid>?test=true
/SUB_GOAL/<uuid>?test=true
/FOLLOW_GOAL/<uuid>?test=true
/QUEUE/<uuid>?test=true
```

When combined with other dev query parameters, keep `test=true` as a normal query parameter:

```txt
/ALERTS/<uuid>?test=true&fixture=main-donate-prepare&muteAudio=true
```

Normal mode accepts only these main event names:

```txt
prepare
started
update
finished
alertList
```

Test mode accepts only these main event names:

```txt
test
t_prepare
t_started
t_update
t_finished
```

Existing legacy backend test commands do not require backend changes because test traffic is identified by event names. The frontend appends `test=true` to WebSocket URLs so a future backend can distinguish test sockets if needed.

## Available main fixtures

- `main-alert-list-set`
- `main-donate-prepare`
- `main-roulette-prepare`
- `main-roulette-started`
- `main-coinflip-prepare`
- `main-coinflip-started`

Example payload shape:

```json
{
  "event": "prepare",
  "id": "fixture-donate-1",
  "key": "donate",
  "args": {}
}
```

## Goal and queue fixtures

- `subs-set`
- `subs-update`
- `followers-set`
- `followers-update`
- `queue-set`
- `queue-add`
- `queue-delete`

Queue note: `queue[0]` is the active event and is intentionally hidden by the queue overlay. Waiting items start at `queue.slice(1)`.

## Audio and timing flags

`muteAudio=true` skips actual audio while preserving preview timing:

```txt
/ALERTS/<uuid>?fixture=main-donate-prepare&muteAudio=true
/TIP_ALERT/<uuid>?fixture=main-donate-prepare&muteAudio=1
```

`fast=true` shortens replay timing for quicker visual checks:

```txt
/ALERTS/<uuid>?fixture=main-donate-prepare&muteAudio=true&fast=true
/TIP_ALERT/<uuid>?fixture=main-donate-prepare&muteAudio=1&fast=1
```

Do not treat `muteAudio` or `fast` as production behavior.

## Route validation checks

Malformed UUID routes, such as `/TIP_ALERT/not-a-uuid`, should render `Overlay not found` because they fail route syntax validation.

Removed routes, such as `/channel/<uuid>` and `/test/channel/<uuid>`, should also render `Overlay not found`.

## Quick local examples

```txt
/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&muteAudio=true
/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&muteAudio=true&fast=true
/REWARD_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-roulette-started&muteAudio=true
/QUEUE/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=queue-set
/SUB_GOAL/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=subs-set
/FOLLOW_GOAL/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=followers-set
/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?test=true&fixture=main-donate-prepare&muteAudio=true
```
