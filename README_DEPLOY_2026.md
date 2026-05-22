# Kaaajka legacy overlays frontend - audit/deploy notes 2026

## Status po migracji

Ten projekt jest starym frontendem overlayów po migracji z Create React App do Vite. Celem nie była przebudowa aplikacji, tylko stabilne hostowanie jako statyczny frontend na Vercel/Netlify.

## Co zostało naprawione

- Zastąpiono Create React App / `react-scripts@4` przez Vite.
- Projekt używa `pnpm@10.17.1` zamiast npm, bo `npm install` i `npm ci` zawieszały się na Vercelu błędem `Exit handler never called`.
- Przypięto Node.js do `22.x`, żeby Vercel nie używał przypadkowo Node 24.
- Dodano `pnpm.onlyBuiltDependencies` dla `esbuild` i `@parcel/watcher`.
- Dodano `vite.config.ts` z obsługą legacy dekoratorów MobX `@observer`.
- Przeniesiono entry HTML do root `index.html`, zgodnie z modelem Vite.
- Zmieniono zmienne CRA:
  - `process.env.PUBLIC_URL` -> `import.meta.env.BASE_URL`
  - `process.env.REACT_APP_ENV` -> `import.meta.env.VITE_APP_ENV`
- WebSocket przeniesiono do env: `VITE_WS_URL`.
- Publiczne assety audio są budowane przez `AppConfig.assetUrl(...)`, więc działają także przy base path.
- Zainicjalizowano pola MobX oznaczone jako `observable`, żeby Vite/MobX nie crashował runtime’owo.
- Usunięto nieograniczoną pętlę Sass `@while` z generowania halo, która mogła zawiesić build na CI/Vercelu.
- Dodano konfigurację Vercel: `vercel.json`.
- Dodano konfigurację Netlify: `netlify.toml`.

## Co celowo zostało nietknięte

- React zostaje na 17.
- React Router zostaje na 5.
- MobX i `mobx-react` zostają.
- Logika overlayów, modeli eventów, kolejek, audio i animacji została zachowana.
- Nie robiono refaktoru klasowych komponentów na hooki.

## Komendy lokalne

```bash
corepack enable
corepack prepare pnpm@10.17.1 --activate
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
pnpm exec tsc --noEmit
```

## Vercel

Build jest kontrolowany przez `vercel.json`.

Environment Variables:

```env
VITE_APP_ENV=prod
VITE_WS_URL=wss://kaaajka.nedi.me/ws
```

Vercel powinien używać:
- Node.js `22.x`
- `pnpm@10.17.1`
- install: `pnpm install --frozen-lockfile`
- build: `pnpm run build`
- output: `dist`

## Netlify

Base directory:

```txt
.
```

Build command:

```txt
pnpm run build
```

Publish directory:

```txt
dist
```

Environment Variables:

```env
VITE_APP_ENV=prod
VITE_WS_URL=wss://kaaajka.nedi.me/ws
```

## Znane długi techniczne

- `src/style/app.scss` nadal używa przestarzałych funkcji Sass: `darken()`, `lighten()`, `random()`.
- SCSS generuje dużo CSS na buildzie. Działa, ale docelowo warto przenieść losową generację efektów do runtime albo zastąpić deterministycznymi keyframes.
- Frontend nadal opiera się na klasowych komponentach i MobX decorators. To jest legacy, ale stabilne po obecnych poprawkach.
