# Biome lint remaining - 2026

## Scope

This report classifies the remaining Biome lint debt after the recent small cleanup commits.
It is intentionally documentation-only. It does not change runtime code, routing, WebSocket logic,
DonateEvent, donation templates, package scripts, Biome config, or TypeScript config.

Requested command:

```bash
pnpm run lint -- --max-diagnostics=200
```

In the assistant execution environment, `pnpm` is not available, so the command could not be executed here.
The classification below is based on the latest local lint output supplied by the project operator and a
source-level scan of the current tree.

## 1. Current lint summary

Latest observed lint output, before removing the `PageChannelQueue` empty props interface, reported:

- Test/build/typecheck status: passing locally.
- Biome lint status: failing.
- Reported totals: 14 errors, 58 warnings, 14 infos.
- Diagnostics were truncated by Biome's default diagnostic limit.
- One known error, `noEmptyInterface` in `PageChannelQueue`, has since been fixed.

Expected current state after that cleanup:

- The `PageChannelQueue` empty interface diagnostic should be gone.
- Remaining lint debt is still expected, especially in donation template components and a few legacy animation helpers.
- `pnpm run lint -- --max-diagnostics=200` should be run locally to refresh the exact counts.

Most common observed rules:

| Rule | Area | Risk if auto-fixed broadly | Notes |
|---|---|---:|---|
| `lint/style/useImportType` | donation templates, `NormalEvent`, model imports | Low/Medium | Low for model imports. Medium for `React` imports while `jsx` remains `react`. |
| `lint/complexity/useArrowFunction` | donation template function components | Low | Safe if component does not use `this`, `arguments`, or function hoisting semantics. |
| `lint/style/useTemplate` | `Donate1`, `Donate2` traffic class names | Low | Mechanical template literal conversion. |
| `lint/suspicious/noPrototypeBuiltins` | `CoinflipEvent`, likely `RouletteEvent` | Medium | Biome prefers `Object.hasOwn`, but project targets ES2021. |
| `lint/suspicious/noArrayIndexKey` | `CoinflipEvent` fixed segment list | High | Do not auto-fix without animation/ref review. |

## 2. Safe mechanical fixes

These are good candidates for small, focused commits.

### Donation template string concatenation

Observed examples:

- `src/components/donations/Donate1.tsx`
- `src/components/donations/Donate2.tsx`

Change only the class name construction:

```tsx
className={`user animate__animated animate__pulse${isTraffic ? " traffic" : ""}`}
```

Risk: low. This should not change rendering if the output string is identical.

Recommended commit:

```txt
refactor(frontend): clean donation traffic class names
```

### Type-only imports for non-React model imports

Good candidates:

- `DonateEventModel` imports in `src/components/donations/Donate*.tsx`
- other model imports that are used only as TypeScript types

Preferred form:

```ts
import type { DonateEventModel } from "../../models/DonateEvent";
```

Risk: low for model imports. This removes type-only imports from runtime output.

Recommended commit:

```txt
refactor(frontend): use type imports in donation templates
```

### Simple function expressions to arrow functions

Observed examples:

- `const Donate1: React.FC<...> = function (...) { ... }`
- same pattern across `Donate2` through `Donate10`

Safe conversion if the function does not use `this`, `arguments`, or rely on function identity semantics:

```tsx
const Donate1: React.FC<IDonate1Props> = ({ donate, images, withCommission }) => {
  // existing body
};
```

Risk: low, but do this in a dedicated donation-template cleanup commit and run manual preview.

Recommended commit:

```txt
refactor(frontend): use arrow components in donation templates
```

## 3. Needs project decision

These should not be fixed mechanically until the project decision is explicit.

### React import type warnings while `tsconfig` uses `"jsx": "react"`

Biome may report `import React from "react"` as type-only in components that use `React.FC` but do not directly use the
`React` runtime binding in JSX. However, the project currently uses the classic JSX runtime:

```json
"jsx": "react"
```

With classic JSX, removing runtime React imports broadly can break typecheck or runtime transform assumptions unless the
component is rewritten carefully or the JSX runtime strategy changes.

Decision needed:

1. Keep classic runtime and avoid broad `React` import cleanup.
2. Switch to automatic JSX runtime in a dedicated, tested commit.

Do not hide this inside a lint cleanup commit.

Recommended commit:

```txt
chore(frontend): decide jsx runtime strategy
```

### `Object.hasOwn` recommendation while `tsconfig` lib is ES2021

Biome recommends:

```ts
Object.hasOwn(images, event.key)
```

But `Object.hasOwn` requires ES2022 typings. The project currently targets ES2021, so this can break typecheck.

Current safe ES2021-compatible pattern:

```ts
Object.prototype.hasOwnProperty.call(images, event.key)
```

Decision needed:

1. Keep ES2021 and tolerate/suppress this Biome diagnostic where needed.
2. Upgrade TypeScript lib target to include ES2022 in a dedicated compatibility commit.

Recommended commit:

```txt
chore(frontend): decide ES2022 object hasOwn strategy
```

### `noArrayIndexKey` in `CoinflipEvent` fixed 100-segment animation

Biome reports `noArrayIndexKey` for the generated 100-segment animation list in `CoinflipEvent`.

Do not auto-fix this yet. The index is coupled to:

- a fixed generated list size,
- `segmentRefs[i]`,
- winner/index based animation logic,
- legacy OBS visual behavior.

Changing keys without understanding that animation can create subtle bugs.

Options:

1. Leave it and document as intentional.
2. Add a targeted Biome suppression comment with a reason.
3. Refactor the segment generation and refs in a dedicated animation-safe commit.

Recommended commit:

```txt
lint(frontend): document intentional coinflip index keys
```

## 4. Recommended next commits

Recommended order:

1. `docs(frontend): classify remaining biome lint debt`
   - This document.
   - No runtime changes.

2. `refactor(frontend): clean donation traffic class names`
   - Only `Donate1` and `Donate2` template literal changes.
   - Very low risk.

3. `refactor(frontend): use type imports in donation templates`
   - Only non-React model type imports first.
   - Avoid broad React import changes until JSX runtime decision.

4. `refactor(frontend): use arrow components in donation templates`
   - Donation template function expressions only.
   - Run fixture/manual donate preview afterwards.

5. `chore(frontend): decide jsx runtime strategy`
   - Either keep classic JSX and suppress/ignore specific React import warnings, or move to automatic JSX runtime.
   - Do not combine with template refactors.

6. `chore(frontend): decide ES2022 object hasOwn strategy`
   - Either keep ES2021-safe `hasOwnProperty.call` with targeted lint suppression, or upgrade lib to ES2022.
   - Do not combine with Coinflip animation changes.

7. `lint(frontend): document intentional coinflip index keys`
   - Add a targeted suppression or write a short comment explaining the fixed animation list.
   - Only after deciding whether suppression comments are acceptable in this repo.

## Do not do yet

Do not do these as part of lint cleanup:

- Do not upgrade React.
- Do not upgrade MobX.
- Do not rewrite DonateEvent.
- Do not change WebSocket payload handling.
- Do not refactor fixture replay.
- Do not change route parsing/runtime routing.
- Do not run `biome check --write .` across the whole repository until the remaining lint categories are split into safe commits.
