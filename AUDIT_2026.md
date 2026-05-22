# Frontend audit 2026 - overlays-legacy

## Werdykt

Frontend jest już sensownie zmigrowany z CRA do Vite, ale problem Vercela nie był samym Vite. Krytyczny problem był w `src/style/app.scss`: generowanie efektu `halo` używało losowej, nieograniczonej pętli Sass `@while`. Lokalnie build często kończył się w 2 sekundy, ale na CI mogło dojść do losowego przypadku, w którym pętla długo szukała niekolidujących współrzędnych albo praktycznie wisiała.

## P0 - blokujące deploy

### 1. Nieograniczona pętla Sass w `halo`
Plik: `src/style/app.scss`

Problem:
- `@while $overlapping` nie miało limitu prób.
- Warunek zależał od losowych wartości `random(...)`.
- Build był niedeterministyczny.
- Lokalnie mógł przejść, a na Vercel wisieć 15-20 minut.

Naprawa:
- Dodano `$attempts` i `$maxAttempts: 50`.
- Po przekroczeniu limitu stosowany jest fallback deterministyczny.
- Usunięto `@debug`, żeby nie spamować logów Vercela.

## P1 - deployment hardening

### 2. npm zawieszał się na Vercelu
Problem:
- `npm install` i `npm ci --legacy-peer-deps` kończyły się `npm error Exit handler never called!`.

Naprawa:
- Projekt używa `pnpm@10.17.1`.
- `vercel.json` wymusza Corepack + pnpm.
- Usunięto `package-lock.json`, dodano `pnpm-lock.yaml`.

### 3. Zbyt luźny Node
Problem:
- `engines.node >=20.19.0` pozwalał Vercelowi podbić runtime do Node 24.

Naprawa:
- `engines.node` ustawione na `22.x`.

## P2 - runtime hardening

### 4. MobX observable fields
Problem:
- Część pól była zadeklarowana jako optional TypeScript fields, ale nie istniała runtime’owo.
- MobX po migracji na Vite crashował na polach typu `currentEvent`.

Naprawa:
- Pola observable są jawnie inicjalizowane przez `= undefined`.

## P3 - dług techniczny

- SCSS nadal używa `darken()`, `lighten()`, `random()`, które są deprecated w Dart Sass.
- React 17, React Router 5 i MobX decorators są legacy.
- Overlaye nadal łączą się przez query param `?account=...`, co jest OK dla legacy, ale nie jest docelowym security modelem dla nowego systemu.
