# Verify Overlay Events

Use this file as a manual QA log for legacy overlay event verification.

| Route | Event | Fixture / Backend action | Expected result | Actual result | Status |
| --- | --- | --- | --- | --- | --- |
| `/ALERTS/:uuid` | alertList set | `src/dev/fixtures/main-alert-list-set.json` | Alert queue stored and first alert can be accepted |  |  |
| `/ALERTS/:uuid` | donate prepare | `src/dev/fixtures/main-donate-prepare.json` | Donate template renders, audio/TTS sequence completes, overlay clears |  |  |
| `/ALERTS/:uuid` | roulette prepare | `src/dev/fixtures/main-roulette-prepare.json` | Roulette prepare view appears |  |  |
| `/ALERTS/:uuid` | roulette started | `src/dev/fixtures/main-roulette-started.json` | Roulette starts and winner/time are applied |  |  |
| `/ALERTS/:uuid` | coinflip prepare | `src/dev/fixtures/main-coinflip-prepare.json` | Coinflip prepare view appears |  |  |
| `/ALERTS/:uuid` | coinflip started | `src/dev/fixtures/main-coinflip-started.json` | Coinflip starts and landing side is applied |  |  |
| `/SUB_GOAL/:uuid` | set | `src/dev/fixtures/subs-set.json` | Subs goal renders current/goal |  |  |
| `/SUB_GOAL/:uuid` | update | `src/dev/fixtures/subs-update.json` | Subs current updates without resetting goal |  |  |
| `/FOLLOW_GOAL/:uuid` | set | `src/dev/fixtures/followers-set.json` | Followers goal renders current/goal |  |  |
| `/FOLLOW_GOAL/:uuid` | update | `src/dev/fixtures/followers-update.json` | Followers goal updates without resetting current |  |  |
| `/QUEUE/:uuid` | set | `src/dev/fixtures/queue-set.json` | Queue stores active item and renders only waiting items |  |  |
| `/QUEUE/:uuid` | add | `src/dev/fixtures/queue-add.json` | Queue adds item once |  |  |
| `/QUEUE/:uuid` | delete | `src/dev/fixtures/queue-delete.json` | Queue removes matching item |  |  |

## Notes

- `queue[0]` is the active event and is intentionally hidden by the queue overlay.
- Fixtures are examples of the legacy backend protocol. They do not replace backend integration tests.
- Real OBS verification should be performed with the production backend and Browser Source.


## Runtime test mode

Use explicit routes with `?test=true`, for example `/ALERTS/:uuid?test=true` and `/QUEUE/:uuid?test=true`. Test mode accepts only `test`, `t_prepare`, `t_started`, `t_update`, `t_finished`; normal mode ignores those test event names.

## Removed route checks

The following old routes are listed only as removed/rejected behavior and should render `Overlay not found`:

```txt
/channel/:uuid
/channel/:uuid/subs
/channel/:uuid/followers
/channel/:uuid/queue
/test/channel/:uuid
```
