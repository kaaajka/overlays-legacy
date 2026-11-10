# Podgląd RC3 nakładek

Gałąź `obs-session-rc3` wywodzi się z produkcyjnego commita `1e1a2e11667d5edfb76247e05a2126a8d36a7dfd`. Zawiera parowanie OBS, obsługę liczbowego ID alertu i poprawkę kolejki Tipply. Nie zawiera późniejszych zmian animacji z innych gałęzi.

Preview tej gałęzi używa `VITE_WS_URL=wss://obs-rc3.invalid/ws` i `VITE_ENABLE_FIXTURE_REPLAY=true`, wyłącznie w środowisku Preview. Endpoint `.invalid` celowo nie wskazuje usługi. Ścieżki z `fixture` odtwarzają dane syntetyczne bez połączenia WebSocket. Sam UUID testowy nie uprawnia do odczytu produkcji. Brak parametru `fixture` oznacza brak działającego backendu w tym Preview.

Przykładowa ścieżka pod adresem wdrożenia:

```text
/ALERTS/11111111-1111-4111-8111-111111111111?fixture=main-donate-prepare&muteAudio=true
/ALERTS/11111111-1111-4111-8111-111111111111?fixture=main-roulette-flow&muteAudio=true
/SUB_GOAL/11111111-1111-4111-8111-111111111111?fixture=subs-set&muteAudio=true
/TIP_ALERT/11111111-1111-4111-8111-111111111111#obs-pair
```

Ostatnia ścieżka wyświetla formularz; parowanie nie zakończy się z endpointem `.invalid`. Ten podgląd nie potwierdza integracji CEF, ciasteczek ani prawdziwego TTS. Formularz parowania pod adresem `vercel.app` i backendem `nedi.me` nie odtworzy produkcyjnej polityki `SameSite=Strict`. Pełna próba wymaga dwóch hostów HTTPS tej samej witryny i izolowanego backendu, bez kont produkcyjnych. Nie osłabiaj `SameSite` na potrzeby Preview.

Budowa w środowisku Preview odrzuca brak endpointu i domenę aktywnego backendu. Produkcyjna konfiguracja oraz alias `widgets.nedi.me` pozostają osobnym etapem wydania.
