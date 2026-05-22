# Kaaajka legacy frontend - deploy audit 2026

## Co zostało naprawione

- Zastąpiono Create React App / `react-scripts@4` przez Vite.
- Usunięto stary konflikt `react-scripts` + TypeScript.
- Usunięto `yarn.lock`; projekt używa npm + `package-lock.json`.
- Dodano `vite.config.ts` z obsługą legacy dekoratorów MobX `@observer`.
- Przeniesiono entry HTML do root `index.html`, zgodnie z modelem Vite.
- Zmieniono zmienne CRA:
  - `process.env.PUBLIC_URL` -> `import.meta.env.BASE_URL`
  - `process.env.REACT_APP_ENV` -> `import.meta.env.VITE_APP_ENV`
- WebSocket przeniesiono do env: `VITE_WS_URL`.
- Publiczne assety audio są od teraz budowane przez `AppConfig.assetUrl(...)`, więc działają także przy base path.
- Dodano konfigurację Vercel: `vercel.json`.
- Dodano konfigurację Netlify: `netlify.toml`.
- Usunięto stary folder `build/` z outputem CRA, żeby nie mylił deployu.

## Co celowo zostało nietknięte

- React zostaje na 17.
- React Router zostaje na 5.
- MobX i `mobx-react` zostają.
- Logika overlayów, modeli eventów, kolejek, audio i animacji została zachowana.
- Nie robiono refaktoru klasowych komponentów na hooki.

## Komendy lokalne

```bash
npm install
npm run dev
npm run build
npm run preview
npx tsc --noEmit
```

## Vercel

Root Directory:

```txt
bocik/frontend
```

Build Command:

```txt
npm run build
```

Output Directory:

```txt
dist
```

Environment Variables:

```env
VITE_APP_ENV=prod
VITE_WS_URL=wss://kaaajka.nedi.me/ws
```

## Netlify

Base directory:

```txt
bocik/frontend
```

Build command:

```txt
npm run build
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

## Test wykonany po migracji

- `npm install --legacy-peer-deps` - OK
- `npm run build` - OK
- `npx tsc --noEmit` - OK

## Ostrzeżenia, które zostały

Build pokazuje ostrzeżenia Sass dotyczące `darken()`, `lighten()` i `random()`. To nie blokuje Vercel/Netlify, ale jest dług techniczny w `src/style/app.scss`.

Następny sensowny etap to osobny commit: modernizacja SCSS pod nowe API Sass. Nie mieszać tego z migracją Vite.
