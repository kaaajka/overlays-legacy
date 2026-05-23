# Biome lint remaining - 2026

## Scope

This report documents the final known Biome lint state for `overlays-legacy` after the focused lint-cleanup commits.
It is intentionally documentation-only. It does not change runtime code, routing, WebSocket logic, DonateEvent,
donation templates, package scripts, Biome config, or TypeScript config.

Requested validation commands:

```bash
pnpm test
pnpm run build
pnpm run typecheck
pnpm run lint
```

In the assistant execution environment, `pnpm` is not available, so these commands could not be executed here.
The final status below is based on the project operator's local validation: test, build, and typecheck pass, and
Biome lint passes with three warnings only.

## 1. Current lint summary

Current accepted state:

- `pnpm test`: passes.
- `pnpm run build`: passes.
- `pnpm run typecheck`: passes.
- `pnpm run lint`: passes with three warnings.

Final remaining warnings:

| File | Warning area | Reason |
|---|---|---|
| `src/components/PageChannel.tsx` | `args.items as any[]` | Legacy backend WebSocket payload boundary. |
| `src/components/PageChannel.tsx` | `args.segments as any[]` | Legacy backend WebSocket payload boundary. |
| `src/models/Event.tsx` | `(this as any)[key] = value` | Legacy dynamic model-update mechanism. |

These warnings are accepted intentionally. They should not be replaced with fake weak types just to make the linter quiet.

## 2. Final accepted warnings

### PageChannel `args.items` / `args.segments`

The casts around `args.items` and `args.segments` sit at the legacy backend WebSocket protocol boundary.
Those values come from the old backend payloads, not from locally controlled frontend state. The frontend must preserve
compatibility with the existing WebSocket payload shapes.

These fields are dynamic protocol data:

- roulette payloads can provide item lists from the backend,
- coinflip payloads can provide segment lists from the backend,
- the old backend contract is more important than idealized frontend-only schemas.

Removing these `any[]` casts properly requires one of these larger changes:

1. typed legacy payload schemas for every main overlay event, or
2. runtime validators/guards that validate `args.items` and `args.segments` before constructing model objects.

That work should be a dedicated protocol-hardening task. It should not be faked with broad types like
`Record<string, unknown>[]` or invented partial interfaces that do not actually validate the backend payload.

Accepted decision: keep these as known warnings until the legacy WebSocket payload layer is typed or validated properly.

### `EventModel.update` dynamic assignment

The assignment below is the legacy dynamic model-update mechanism:

```ts
(this as any)[key] = value;
```

`EventModel.update(...)` accepts backend-derived model update data and applies matching keys to the current model.
This is dynamic by design in the legacy frontend. Changing it safely requires a larger typed model-update refactor,
including deciding which model fields can be updated dynamically and how unknown fields should be handled.

Keeping this as an accepted warning is safer than pretending the assignment is strongly typed. A fake type assertion here
would make the code look cleaner while hiding the same dynamic behavior.

Accepted decision: keep the warning until a dedicated typed model update refactor is planned and tested.

## 3. Already resolved lint categories

These categories were cleaned in focused commits and should not reappear casually:

- React Router runtime dependency removed after route parser migration.
- Simple empty React state type arguments removed.
- Simple empty props interfaces removed where safe.
- Automatic JSX runtime enabled.
- Donation template function-expression and template-literal style issues cleaned.
- Local template media ownership documented and aligned.
- `Object.hasOwn` enabled through ES2022 lib and applied to existing ownership checks.
- Intentional fixed animation index keys documented with local Biome ignores.
- `DonateEvent` simple style and type issues cleaned without changing donate lifecycle.
- Model import-type and simple model style issues cleaned.

## 4. Recommended next commits

Do not chase the final three warnings as a casual lint cleanup. The safe next steps are larger, explicit tasks:

1. `test(frontend): add protocol guards for roulette and coinflip payload args`
   - Validate `args.items` and `args.segments` at the WebSocket boundary.
   - Keep compatibility with the old backend.

2. `refactor(frontend): type main overlay payload args`
   - Replace the remaining `any[]` casts only after guards/types exist.
   - Cover roulette and coinflip fixture payloads with tests.

3. `refactor(frontend): type legacy model update fields`
   - Replace `(this as any)[key] = value` only after the model update contract is explicit.
   - Avoid breaking dynamic legacy update behavior.

## Do not do yet

Do not do these as part of the final lint cleanup:

- Do not upgrade React.
- Do not upgrade MobX.
- Do not rewrite DonateEvent.
- Do not change WebSocket payload handling without tests and fixtures.
- Do not replace the remaining `any` casts with fake weak types.
- Do not refactor `EventModel.update` without a dedicated model-update plan.
- Do not run `biome check --write .` as a broad cleanup unless the resulting diff is reviewed separately.
