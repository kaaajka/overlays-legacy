# Verify Overlay Events

Use this file as a manual QA log for legacy overlay event verification.

| Route | Event | Fixture / Backend action | Expected result | Actual result | Status |
| --- | --- | --- | --- | --- | --- |
| `/channel/:uuid` | alertList set | `src/dev/fixtures/main-alert-list-set.json` | Alert queue stored and first alert can be accepted |  |  |
| `/channel/:uuid` | donate prepare | `src/dev/fixtures/main-donate-prepare.json` | Donate template renders, audio/TTS sequence completes, overlay clears |  |  |
| `/channel/:uuid` | roulette prepare | `src/dev/fixtures/main-roulette-prepare.json` | Roulette prepare view appears |  |  |
| `/channel/:uuid` | roulette started | `src/dev/fixtures/main-roulette-started.json` | Roulette starts and winner/time are applied |  |  |
| `/channel/:uuid` | coinflip prepare | `src/dev/fixtures/main-coinflip-prepare.json` | Coinflip prepare view appears |  |  |
| `/channel/:uuid` | coinflip started | `src/dev/fixtures/main-coinflip-started.json` | Coinflip starts and landing side is applied |  |  |
| `/channel/:uuid/subs` | set | `src/dev/fixtures/subs-set.json` | Subs goal renders current/goal |  |  |
| `/channel/:uuid/subs` | update | `src/dev/fixtures/subs-update.json` | Subs current updates without resetting goal |  |  |
| `/channel/:uuid/followers` | set | `src/dev/fixtures/followers-set.json` | Followers goal renders current/goal |  |  |
| `/channel/:uuid/followers` | update | `src/dev/fixtures/followers-update.json` | Followers goal updates without resetting current |  |  |
| `/channel/:uuid/queue` | set | `src/dev/fixtures/queue-set.json` | Queue stores active item and renders only waiting items |  |  |
| `/channel/:uuid/queue` | add | `src/dev/fixtures/queue-add.json` | Queue adds item once |  |  |
| `/channel/:uuid/queue` | delete | `src/dev/fixtures/queue-delete.json` | Queue removes matching item |  |  |

## Notes

- `queue[0]` is the active event and is intentionally hidden by the queue overlay.
- Fixtures are examples of the legacy backend protocol. They do not replace backend integration tests.
- Real OBS verification should be performed with the production backend and Browser Source.
