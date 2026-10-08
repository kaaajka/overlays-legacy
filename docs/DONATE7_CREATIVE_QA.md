# Donate7 — creative direction pass / QA

Archiwum **Version A**, bez wizualnej akceptacji właściciela. Static finish review: PASS; obie materialne uwagi RESOLVED. Końcowa dyspozycja reviewera: **HOLD for production acceptance** — wymagana ocena muzyki/ruchu przez właściciela i pomiar docelowego OBS. Nie merge'owano main. Gałąź `michal-szwindowski/donation-motion-engine`; bazowy HEAD `cfcf77a1ae4bdac124e747de5ce8b1f5f5cf4543`. Implementacja zabezpieczona commitem `842f6ac` przed kolejnym definitive redesign pass; ten raport i evidence zachowują wyniki Version A, nie stanowią akceptacji jej kierunku kreatywnego.

## Przed / po

Przed: poprawny hero i małe oryginalne źródło, lecz po zbudowaniu ściany sześć identycznych posterów oraz powtarzana fala pieniędzy utrzymywały podobny obraz przez większość dalszego utworu. Typografia miała zbliżoną wagę, bez wyraźnych kolejnych rozdziałów.

Po: jeden mały sygnał rekrutuje ciepłą, ręcznie stylizowaną ścianę CRT. CO / ZA przygotowuje trzy kolejne przerwania transmisji; monitory zmieniają odpowiedzialność, światło odpowiada drobnym onsetom, ściana odzyskuje spokój i dopiero finał uruchamia największą kaskadę. Donor pozostaje poza kamerą. Materiał 120×120 zachowuje kolory i charakter; 240 px to bazowe okno głównego źródła, krótkie mnożniki ściany/kamery podnoszą je nieco powyżej tej wartości. Sześć wspierających okien używa czterech bezstratnych póz oryginalnego GIF-a (klatki 0/15/38/62), trzy filmy zachowują oryginalny WebM i phase offsets.

## Storyboard i muzyka

Niezmieniony lokalny fragment Hislerim: 46.23397 s, estymowane 129.199 BPM. Rozdziały są decyzjami montażowymi opartymi na istniejących cue, zmierzonych onsetach i kandydatach RMS; nie deklarują zweryfikowanych formalnych części utworu ani znaczenia słów. Brak zatwierdzonych lyric captions. Pełna mapa z primary/secondary, kamerą i efektami: [direction + storyboard](DONATE7_CREATIVE_DIRECTION.md).

| Czas | Rozdział / działanie |
|---|---|
| 0–4.45823 | Czyste zero, pojedynczy mały sygnał, krótki HALO. |
| 4.45823–11.80735 | Pierwszy mocny onset rekrutuje źródło i satelity; donor wchodzi od 5.2 s. |
| 11.80735 / 12.27175 | Osobne mechaniczne CO i ZA, przygotowanie hero. |
| **13.21215** | POJEB slam, camera punch, pełna kwota od dokładnego cue, bilaterale pieniądze/papier. Firework 13.39215, wstążki +240 ms. |
| 16.43973–22.89488 | Rytmiczne odpowiedzi grup monitorów, selective money, WTF. |
| **22.89488** | Odwrócony wachlarz ściany, echo typografii, paper top cascade; firework 23.07488. |
| 25.44907 / 30.25 | Nowa odpowiedź ściany, następnie jej składanie i wygaśnięcie poprzednich trajektorii. |
| **33.52961–36.06059** | Wizualny false calm, jeden CRT, brak ciągłego deszczu. Muzyka nadal głośna — to kontrapunkt obrazu. |
| 36.06059 | Ponowna rekrutacja, antycypacja przed finałem. |
| **37.66277** | Największe przerwanie typograficzne → cash sweep → cannons → streamers; fireworks **37.84277 / 38.20277**, secondary action w kolejnych 1.2 s. |
| 40.91356 / **43.67673** | Afterglow i autorskie wyjście: typografia się chowa, CRT gasną kolejno, pozostaje małe źródło. |
| 46.23397 → koniec | Dotychczasowe Information → nickname → amount → message → outro → complete. |

## Systemy wizualne i implementacja

- Cztery fireworks: launch, radial burst, opóźniona odpowiedź, grawitacja, wygaszenie.
- Seeded confetti: krótkie kartki, paski, wielkości i rotacja; peach/pink/cream/cyan, okazjonalny oryginalny bunny stamp.
- Kręcone streamers: płynne Bezier arcs, bez prostych łamanych.
- Pieniądze BACK / MID / FRONT: inne skale, opacity i drogi; rzeczywiste granice donora odchylają trajektorie płynnie. Nie ma prostokątnego wycinania cząstek.
- CRT monitor choreography: naprzemienne grupy, pose holds, ekspozycja/scanline, przegrupowanie i shutdown.
- Kamera: drift, ograniczone punch i recovery; donor/amount poza jej transformacją.
- Typografia: SplitText, CO/ZA, krótki takeover, outline echo, overshoot/settle; jawnie inicjalizowane litery przed każdym slamem.
- Stickers: oryginalne bunny-cheer i bunny-cyan w punktowych reakcjach.
- Akcenty: sześć DrawSVG impact strokes na istniejącej scenie.
- Atmosfera: czasowy blackout/light, kontrolowane bardzo krótkie ghost/glitch echo.

GSAP CustomEase / SplitText / DrawSVG, nazwane moduły lokalne, jedna paused timeline seekowana absolutnym czasem muzyki. Canvas ma skończony inventory i analityczne trajektorie; brak własnego RAF, losowania przy renderze lub dodatkowego zegara. Shared lifecycle/data contract bez zmian. Studio dostało tylko selektory tych warstw i statystyki do QA Donate7.

## Wydajność

Aktualny headless Chromium 153 na tym hoście, DPR 1, rzeczywisty zegar audio, 12–24 s odtwarzania, bez równoległego browser QA. To cadence strony/kompozytora, **nie certyfikat OBS ani pomiar wyłącznie GPU**. Canvas2D p95 mierzy CPU submission, nie całkowity koszt rasteryzacji.

| Output | Frame median / p95 ms | Canvas2D p95 ms | JS heap MiB | Końcowa jakość |
|---|---:|---:|---:|---|
| 1920×1080 | 33.3 / 33.4 | 1.00 | 23.8 | SAFE |
| 2560×1440 | 33.4 / 66.7 | 1.00 | 26.4 | SAFE |
| 3440×1440 | 66.6 / 66.8 | 0.90 | 32.2 | MEDIUM |
| 3840×2160 | 100.0 / 133.4 | 1.10 | 19.4 | MEDIUM |
| 5120×1440 | 66.7 / 133.3 | 1.10 | 25.0 | MEDIUM |

Cadence 33–133 ms p95 nie potwierdza 60 FPS. Governor automatycznie redukuje density. Oryginalne media pozostają `ready`; dane pokazują skipped presented frames i korekty driftu w headless. Duże wartości `seekLatencyMs` przy zwykłym forward decode zawierają czas między wcześniejszym seekiem a późniejszym eventem; nie są izolowanym benchmarkiem dekodera. Dokładne requested/presented frames i wszystkie liczby: [performance.json](assets/donate7-creative/performance.json).

Budżety HIGH/MEDIUM/SAFE: **480 / 260 / 110 particles**, nominalnie **2M / 1.2M / 650k pixels na canvas** (trzy bufory). Zaokrąglenia wymiarów dają dla HIGH około **6.003M** łącznie. Największa zweryfikowana statyczna klatka HIGH ma 478 cząstek; testy przechodzą całą długość każdego budgetu. Piki benchmarku 12–24 s: 288. JS heap nie obejmuje całej pamięci mediów, GPU ani procesu. SAFE zachowuje cztery fireworks, trzy głębokości i wszystkie cue, usuwa trails i ogranicza density. Dispose zwalnia inventory i redukuje canvasy do 1×1.

Pełne nagranie real-time zaczyna na HIGH i governor przechodzi przez MEDIUM do SAFE; maksimum próbkowane co100ms w tym nagraniu:108 particles. Nie jest to stały HIGH demo. Artefakty HIGH i porównania pozostałych budżetów są osobnymi klatkami. Pomiar docelowego OBS/hardware nadal wymagany.

## Materiały do oceny

- [Pełny real-time film z audio](assets/donate7-creative/donate7-full-realtime-audio.mp4): **53.28 s**, 1920×1080 H.264/AAC, 745 rzeczywistych CDP captures z timestampami, kontener30fps może powtarzać klatki. Rzeczywiste wyjście WebAudio muzyki i aktualnych lokalnych czytań Pauliny; audio nie podmieniono offline. Mean -13.8dB, peak -0.4dB. Wszystkie sześć faz do complete, errors=[]; [capture metadata](assets/donate7-creative/realtime-recording.json).
- [Chapter contact sheet](assets/donate7-creative/round-2/chapters.jpg): initial, build, hero, secondary, recovery, false calm, final, settle, exit. Są to pozostałe aktualne settled views z drugiej rundy.
- [Aktualne payoff ±250/0/+250/+500/+750/+1000ms](assets/donate7-creative/payoffs-current.jpg): trzy główne cue, po poprawkach granic seek.
- [16:9 / 21:9 / 32:9 hero/final](assets/donate7-creative/formats.jpg): oryginalny stream, native1920×1080 /3440×1440 /5120×1440.
- [Aktualny Studio shell](assets/donate7-creative/studio-final.png): Donate7 na realnym streamie w Program.
- [Exact hero](assets/donate7-creative/review-correction/hero-exact.jpg), [powrót +250→exact](assets/donate7-creative/review-correction/hero-fresh.jpg), [milion +32W](assets/donate7-creative/review-correction/hero-million-exact.jpg).
- Round2 zawiera dodatkowo16:10, HIGH/MEDIUM/SAFE, checker, transparent i solid. Review-correction bright/dark/contrast to syntetyczne filtry oświetlenia na oryginalnym streamie, nie trzy odrębne materiały gameplay. Surowe earlier round1 i starsze round2 exact payoff są historią QA, nie finalnym dowodem poprawionych granic.

## Testy i dowody

Finalna tabela niezależnego review:

| Obszar | Werdykt |
|---|---|
| Kierunek, małe źródło, statyczna kompozycja | PASS |
| Exact-hero amount | RESOLVED |
| +250ms → exact headline geometry | RESOLVED |
| Stress hierarchy i dokumentacja | PASS |
| Muzyka/ruch — akceptacja właściciela | PENDING |
| Docelowe OBS/hardware | PENDING |

**Disposition: HOLD for production acceptance; static finish review passes.** Bez rebuild directive i bez otwartych materialnych poprawek wizualnych w tym bounded review.

- `pnpm test`: **327 pass /34files**.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS; główny JS793.07kB (gzip244.59), warning >500kB pozostaje.
- `pnpm lint`: PASS,0errors,44warnings/38infos — baseline bez nowej diagnozy.
- Pełna regresja browser: **79/80 PASS przed poprawką oczekiwania w teście QA; następnie 4/4 PASS w dwukrotnym powtórzeniu obu dotkniętych testów.** Ostatni pełny run zaliczył wszystkie nowe testy Donate7 oraz czyste frame zero wszystkich siedmiu scen. Pozostały test Full timeline odczytywał plan przed zakończeniem przygotowania TTS i fazę przed aktualizacją React. Test teraz czeka na `speechDirty=false` i oczekiwany stan; tak samo czeka asercja pointer/cue. Te same asercje, bez zmiany kodu produkcyjnego Donate6. Nie wykonano kolejnego pełnego runu 80 testów po tej korekcie harnessu; nie deklarujemy pojedynczego finalnego 80/80. Pierwszy run 78/80 ujawnił też opacity Donate7 w frame zero — poprawiono start źródła na 0.05 s, a focused opening i drugi pełny run potwierdziły naprawę.
- Scoped reconstruction: PASS. Fresh→+250→same cue oraz2s→same cue; exactcomputed glyph transforms,6sampleframes. Screenshot AA tolerancja24/255, max1000pixels (<.05%1080p); nie jest to byte-identyczność screenshotów SwiftShader. Canvas drawing commands są porównywane dokładnie; native backing clear obejmuje zaokrąglone krawędzie.
- Cztery formaty × siedem kwot × fresh/reverse exact cue: pełne amountdigits,32Wname, gap, source bounds. Kwoty5,57.32,999.99,2137.69,15000,99999.99,1000000.
- Normal full lifecycle z32W: hero/nickname/amount/message/outro/complete.
- CLI VP9+alpha:1920×1080 hero dwa niezależne eksporty po2frames,1920×1080 zero3frames,3440×1440 i5120×1440 finał po2frames. Native repeatedhero PNG SHA identyczne w obu eksportach. Encoded zero zdekodowane przezlibvpx-vp9: alpha[0,0],0nieprzezroczystych pikseli. To próbki nowej sceny, nie podwójny pełny53s eksport. [Export proofs](assets/donate7-creative/export-proofs.json).
- Detector raz:[]; własne dwie rundy, następnie fresh reviewer/documenter. Reviewer amount+headline findings RESOLVED. **HOLD for production acceptance; static finish review passes.**

## Git diff / zakres

Donate7Scene, lokalna choreografia/CSS/show/SpectacleRenderer, cztery oryginalne posePNG, testy i lokalny QA script. DonationScene integruje tier7renderer/resize/quality/dispose; directorTools dostaje opt-in ownRhythm, inne sceny zachowują default. CashRenderer zwraca authored cashcues dla timeline7;5/6bez zmiany. MotionStudio: dwa selektory warstw i jeden stats field. Istniejący test motion-studio-2.1 dostał trzy oczekiwania na asynchroniczny stan, bez zmiany asercji. DESIGN/sidecar/TREATMENT oraz ten raport i evidence. Bez nowych zależności, zmiany źródłowego GIF/WebM/MP3, infrastruktury, publicznego Studio, resetu ani merge'a.

## Otwarte ograniczenia / decyzja

Ocena czy finał i synchronizacja muzyczna są wystarczająco mocne należy do właściciela; stills i zaliczone testy tego nie rozstrzygają. Moving gameplay/OBS hardware nie były dostępne jako zautomatyzowany benchmark. Headless cadence jest słaba, więc wydajność produkcyjna pozostaje niepotwierdzona. Dokładność logicznego seeku i powtarzalne próbki CLI są potwierdzone; byte-parity screenshotów pomiędzy backendami GPU nie jest obiecana. Lokalna Paulina służy QA, produkcyjny provider Google pozostaje dotychczasowy.
