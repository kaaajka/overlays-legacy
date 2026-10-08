# Motion Studio — kontynuacja post-v2.2

Gałąź: `michal-szwindowski/donation-motion-engine`. Zachowano zastany niezacommitowany pass v2.2 i oryginalne GIF-y/MP3. Nie wykonano resetu, checkoutu ani merge do main. Punktem wyjścia był `a0021d3d871f3cef31f9c469b6eddf9fed5df251`.

Implementacja: `fae7e11fc07418f7c67b7c8efdcff6fc446df96e`. Wyniki dotyczą kodu tego commitu. Końcowy SHA dokumentacji i zgodność z remote są raportowane po push.

## Realizacja zakresu A–Z

| Zakres | Obecne zachowanie / dowód |
|---|---|
| A | Zachowana diagnoza Donate5: pusty HTTP204 przed dekodowaniem, niezerowy PCM po podaniu identycznych bajtów przez lokalny adres. Historyczne dowody: [QA v2.2](PRODUCTION_22_QA.md). |
| B | Świeże otwarcie: Donate1, Pełny alert, ręczny tier, realny stream, brak IN/OUT, pętla wyłączona, eksport pełnego alertu. URL ma pierwszeństwo. |
| C | Lokalny SAPI generuje rzeczywiste aktualne teksty, cache po głosie i znormalizowanym tekście, debounce650ms/stan odświeżenia, pomierzone długości WAV. Paulina i Zira są rzeczywistymi dostępnymi głosami na tym hoście. Produkcyjne Google male1–2/female3–7 pozostają bez zmian; lokalny dostawca jest jawnie opisany. HTML/URL nie trafiają do mowy. Prowizja i polska odmiana kwot mają testy. Eksport sprawdza niezmienny tekst/głos/hash/czas każdego klipu. |
| D–E | Wspólny zegar próbek muzyki i aktualnej mowy, wznowienie z głowicy, osobny restart0. FIFO produkcji zachowane. Błąd renderu podglądu jest izolowany; test wstrzykuje wyjątek i potwierdza edytowalne dane oraz widoczną oś. |
| F–H | Nullable selection; wyczyszczenie usuwa uchwyty i wyłącza pętlę. Pętle hero, czytania, granic faz i outro rekonstruują źródła. Zapętl wokół punktu wybiera±300ms, ustawia IN, włącza pętlę i centruje. |
| I–M | Centrowanie wykorzystuje rzeczywistą geometrię nagłówka; testuje zoom1/4/16/64/128 i10/50/90%. Wspólny nawigator pan/edgezoom, Ctrl-wheel pod wskaźnikiem, Shift-wheel,±/dopasuj. Jedna globalna głowica, wspólne szerokości osi. Edytowalny timecode w miejscu, walidacja bez skoku0. Polski dialog11 skrótów z Esc/focusem; test sprawdza też czytelne wymiary wszystkich opisów. |
| N–P | Monitor10–400%, zoom pod wskaźnikiem, osobne centrowanie, pan pionowy/poziomy/drag, presety i własny format. Scena ma kanoniczną wysokość1080 i szerokość z rzeczywistych proporcji viewportu. To nie stała wyspa1920px. Źródła pozostają ograniczone, kompozycja i efekty wypełniają szerszy format. Eksport przyjmuje i weryfikuje rzeczywiste wymiary. |
| Q–S | Zachowane siedem odrębnych mini-show: mniejsze okna źródeł, specyficzne formy/lettering/emoty, antycypacja i kulminacje na istniejącej osi. Testy672 kombinacji:7 scen×8 formatów×12 kwot, nazwa32W; bez zmiany czasów kulminacji. [Inspekcja kulminacji](assets/post-2.2/payoff-inspection/payoffs.jpg). |
| T | Natywne odtwarzanie podczas normalnego ruchu śledzi muzykę; scrub/hold/export wybierają klatki dokładnie. rVFC mierzy faktycznie przedstawione mediaTime/klatki, seek/coalescing i korekty. Benchmark21 wariantów/840 seeków: [seeks.json](assets/post-2.2/seeks.json). Tylko pochodne WebM4/6 zmieniono na GOP1; GIF/MP3 i czasy klatek pozostają zachowane. |
| U | Sześć banknotów z siedmiu za źródłem/tekstem, jeden przed nimi; rzeczywiste granice darczyńcy, ciągłe trajektorie, niezerowy miękki spadek alfa obu warstw. Usunięto stałe prostokąty kasowania. Przegląd potwierdził poprawiony kontrast Donate5. |
| V | [Tożsamości muzyki](../src/dev/motion-studio/musicIdentity.json) rozdzielają metadane, hipotezy, wersję i pewność. Donate3 pozostaje nieznane; Donate6 jest kandydatem, dokładne mastery nie są udawane. Rozpoznane słowa, zatwierdzone frazy i reakcje semantyczne mają oddzielne role. Żadna fraza nie otrzymała niezasłużonego zatwierdzenia odsłuchu; ASR nie napędza nowych semantycznych efektów. Nie dodano pełnych tekstów piosenek. |
| W | Information jest zależne od treści, około560×165 dla krótkiej wiadomości; maksymalna szerokość960. Stały nagłówek, przewijane wyłącznie ciało,225 znaków,32 znaki nazwy i stabilne emoty. Warstwa opacity jest stabilna także przy bezpośrednim seeku; test7 scen porównuje całe PNG po różnych historiach animacji. |
| X–Y | Manifest standalone, własne ikony, service worker, instalacja gdy przeglądarka oferuje prompt, jawna aktualizacja. Cache powłoki nie cache’uje usług/mutacji. Pierwsze załadowanie offline utrzymuje UI i uczciwy komunikat niedostępności. Mały adapter odseparowuje TTS/eksport/persistencję. Edytor pozostaje desktopowy i polski. |
| Z | Wyniki i ograniczenia poniżej; realny stream jest podstawowym tłem wszystkich dowodów scen. |

## Kontrole końcowe

- TypeScript: zaliczony. Vitest:321 testów,33 pliki.
- Pełny Playwright:77 testów,0 pominiętych,0 błędów,0 flaky,321,922s. [Wynik maszynowy](assets/post-2.2/browser-results.json).
- Build: zaliczony. Zachowane ostrzeżenie o głównym chunku>500kB; Studio jest ładowane osobno. Lint:0 błędów,44 ostrzeżenia CSS!important i38 informacji stylistycznych; nie ukrywano ich ustawieniami. [Logi](assets/post-2.2/lint-results.txt).
- Wszystkie56 PNG klatki zero sprawdzone po całej płaszczyźnie alfa: min=max0. Osiem zakodowanych przezroczystych WebM ma poprawne wymiary i pełne alfa0 po dekodowaniu libvpx. Osiem dodatkowych eksportów kulminacji ma identyczne PNG jak podgląd. [Acceptance JSON](assets/post-2.2/acceptance.json).
- Aktualny Full Alert Donate1/Victor/2137,69/nowa wiadomość:518 klatek,1280×720,30fps,17,266667s. Te same trzy hashe WAV i identyczne PNG klatek0/259/517; RMS czytania0,0284/0,04294/0,03983. [Wideo](assets/post-2.2/full-victor-2137.69.mp4), [manifest](assets/post-2.2/full-export-manifest.json).
- Normalne odtwarzanie siedmiu mini-show zapisano w Chrome154; recorder ma30fps przy viewport1920×1080, więc jego klatek nie wolno utożsamiać z60Hz zegarem silnika ani natywnym FPS GIF-a. [Zapis runtime](assets/post-2.2/normal-motion-summary.json); pliki donate1–7-normal.webm w tym samym folderze. Dodatkowa inspekcja obejmuje sześć absolutnych pozycji względem kulminacji każdego show. Osobne nagrania Full Alert wszystkich siedmiu scen potwierdziły trzy fazy czytania, outro i Complete: [pełny runtime](assets/post-2.2/full-motion-summary.json), pliki donate1–7-full-normal.webm. Nagrania ekranu nie zawierają ścieżki audio; odczyt jest sprawdzony osobno przez PCM/RMS i zakodowany eksport.

## Pomiar mediów i decyzja

| Scena | p95 seek starego GOP16 | p95 GOP1 | Zmiana bajtów |
|---|---:|---:|---:|
| Donate4 |281,8ms|116,1ms|13,56→21,52MB (+59%)|
| Donate6 |272,7ms|127,0ms|16,23→25,28MB (+56%)|

Pozostałych pięciu plików nie zastąpiono. To kompromis kosztu pobrania i inspekcji, nie dowód, że większy plik zawsze poprawia normalne odtwarzanie. Kontrolowane porównanie starych/nowych4/6 z poprawnymi HTTPRange pokazuje sprawne natywne dekodowanie obu wersji: [porównanie](assets/post-2.2/runtime-controlled-comparison.json). Nieważne wiersze ze wcześniejszego mocka bez obsługi Range zostały wyłączone z publikowanych wyników. Intended seeks/holdy nie są zaliczane jako utracone klatki normalnego odtwarzania.

## Świeży przegląd Impeccable

Przeprowadzono wymagany świeży review i dwa verdict passes. Końcowe `disposition: ship` dotyczy czterech poniższych material findings.

| Named finding | Score |
|---|---|
| Unreadable shortcut dialog | Resolved |
| Donate5 cash washes out nickname | Resolved |
| Missing final small-screen evidence | Resolved |
| Stale cash documentation | Resolved |

[Poprawione skróty](assets/post-2.2/review-1/shortcuts.jpg), [Donate5 HD](assets/post-2.2/review-1/donate5-1920x1080.jpg), [Donate5 32:9](assets/post-2.2/review-1/donate5-5120x1440.jpg), [blokada małego ekranu](assets/post-2.2/review-1/studio-390x844.jpg). Round1/round2 pozostają historycznymi etapami; finalne poprawki są w review-1. Shipped documenter zaktualizował DESIGN.md i sidecar z kodu. Reviewer nie uznał statycznych obrazów za dowód jakości ruchu na poziomie After Effects.

## Ograniczenia i odtwarzalność

Nie wykonano testu w natywnym OBS/CEF ani instalacji systemowej PWA. PWA nie zastępuje Node/FFmpeg/SAPI; ten host udostępnia lokalne głosy Windows, nie usługę Google. Nie ma ręcznie zatwierdzonych słów/fraz ani pewnej dokładnej wersji każdego lokalnego wycinka. Identyfikacja nie opiera się na udawanym fingerprintingu. Nie można obiecać0 zgubionych klatek na każdym GPU/DPR; benchmark pokazuje warunki i pomiary tego hosta. Ocena art direction nie oznacza aprobaty właściciela ani certyfikacji „AE-level”.

Reprodukcja: `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm lint`, `pnpm exec playwright test`; serwer: `pnpm dev --host 127.0.0.1`. Dodatkowe skrypty: `scripts/verify-post-2.2.mjs`, `scripts/capture-post-2.2-review.mjs`, `scripts/record-post-2.2-motion.mjs`. Weryfikator wymaga przygotowanego Full eksportu w `.motion-qa/continuation/final/full` (lub `STUDIO_QA_FULL_EXPORT`) oraz Pythona/Pillow (`STUDIO_QA_PYTHON`).

Dokładny wykaz wszystkich zmian: [files-changed.txt](assets/post-2.2/files-changed.txt). Prompty i wygenerowane grafiki literowe: [PRODUCTION_22_LETTERING.md](PRODUCTION_22_LETTERING.md).
