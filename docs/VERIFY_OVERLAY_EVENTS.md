# Verify Overlay Events

Use this file as a manual QA log for legacy overlay event verification.

Overlay URLs should not be shown publicly.

## Active normal-mode routes

| Route | Event | Fixture / Backend action | Expected result | Actual result | Status |
| --- | --- | --- | --- | --- | --- |
| `/ALERTS/:uuid` | alertList set | `src/dev/fixtures/main-alert-list-set.json` | Alert queue stored and first alert can be accepted |  |  |
| `/ALERTS/:uuid` | donate prepare | `src/dev/fixtures/main-donate-prepare.json` | Donate template renders, audio/TTS sequence completes, overlay clears |  |  |
| `/TIP_ALERT/:uuid` | donate prepare | `src/dev/fixtures/main-donate-prepare.json` | Donate template renders and non-donate events are ignored |  |  |
| `/REWARD_ALERT/:uuid` | donate prepare | `src/dev/fixtures/main-donate-prepare.json` | Donate is ignored |  |  |
| `/ALERTS/:uuid` | roulette prepare | `src/dev/fixtures/main-roulette-prepare.json` | Roulette prepare view appears |  |  |
| `/REWARD_ALERT/:uuid` | roulette started | `src/dev/fixtures/main-roulette-started.json` | Roulette starts and winner/time are applied |  |  |
| `/ALERTS/:uuid` | coinflip prepare | `src/dev/fixtures/main-coinflip-prepare.json` | Coinflip prepare view appears |  |  |
| `/REWARD_ALERT/:uuid` | coinflip started | `src/dev/fixtures/main-coinflip-started.json` | Coinflip starts and landing side is applied |  |  |
| `/SUB_GOAL/:uuid` | set | `src/dev/fixtures/subs-set.json` | Subs goal renders current/goal |  |  |
| `/SUB_GOAL/:uuid` | update | `src/dev/fixtures/subs-update.json` | Subs current updates without resetting goal |  |  |
| `/FOLLOW_GOAL/:uuid` | set | `src/dev/fixtures/followers-set.json` | Followers goal renders current/goal |  |  |
| `/FOLLOW_GOAL/:uuid` | update | `src/dev/fixtures/followers-update.json` | Followers goal updates without resetting current |  |  |
| `/QUEUE/:uuid` | set | `src/dev/fixtures/queue-set.json` | Queue stores active item and renders only waiting items |  |  |
| `/QUEUE/:uuid` | add | `src/dev/fixtures/queue-add.json` | Queue adds item once |  |  |
| `/QUEUE/:uuid` | delete | `src/dev/fixtures/queue-delete.json` | Queue removes matching item |  |  |

## Runtime test mode

Use the same explicit routes with `?test=true`:

```txt
/ALERTS/:uuid?test=true
/TIP_ALERT/:uuid?test=true
/REWARD_ALERT/:uuid?test=true
/SUB_GOAL/:uuid?test=true
/FOLLOW_GOAL/:uuid?test=true
/QUEUE/:uuid?test=true
```

Normal mode accepts `prepare`, `started`, `update`, `finished` and `alertList` where relevant. Test mode accepts only `test`, `t_prepare`, `t_started`, `t_update`, `t_finished`.

Existing backend test commands do not require backend changes because test traffic is identified by event names.

## Removed route checks

The following should render `Overlay not found` and must not be treated as active routes:

```txt
/channel/:uuid
/channel/:uuid/subs
/channel/:uuid/followers
/channel/:uuid/queue
/test/channel/:uuid
```

## Notes

- `/` renders the Home/link generator page.
- `queue[0]` is the active event and is intentionally hidden by the queue overlay.
- Fixtures are examples of the legacy backend protocol. They do not replace backend integration tests.
- Real OBS verification should be performed with the production backend and Browser Source.
