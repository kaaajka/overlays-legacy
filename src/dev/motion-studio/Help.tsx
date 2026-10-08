import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
const topics = {
  seed: [
    "Ziarno losowania",
    "Ten sam tekst ziarna daje ten sam układ banknotów i detali. Zmienia ich rozmieszczenie, bez przesuwania punktów muzyki.",
  ],
  quality: [
    "Poziom szczegółów",
    "AUTO dobiera budżet do płynności. HIGH pokazuje pełne detale, MEDIUM ogranicza ich liczbę, SAFE zachowuje scenę z małą liczbą banknotów. Jakość nie zmienia czasu animacji.",
  ],
  bpm: [
    "BPM i rytm",
    "BPM to liczba uderzeń na minutę. Uderzenie wyznacza puls; początek taktu grupuje uderzenia. Szacunki z analizy wymagają sprawdzenia słuchem. Zatwierdzone punkty sterują sceną.",
  ],
  cue: [
    "Punkty animacji",
    "Punkt wiąże gest z czasem utworu. heroDrop to odsłonięcie kwoty. Okolica punktu zaznacza krótki fragment do sprawdzenia. Muzyka pozostaje zegarem.",
  ],
  media: [
    "Media źródłowe",
    "Gotowość pliku oznacza zakończenie wczytywania. Wejście jest osobnym gestem. Pętla powtarza GIF, zatrzymanie zachowuje pozę na mocnym akcencie, wznowienie kontynuuje od niej. Informacja zwalnia źródło.",
  ],
  vocal: [
    "Wokal i zatwierdzenie",
    "Automatycznie rozpoznane słowa i reakcje są kandydatami. Sprawdź początek i koniec, potem zatwierdź. Dopiero zatwierdzony punkt staje się świadomą decyzją choreografii.",
  ],
  snap: [
    "Przyciąganie",
    "Przyciąga głowicę i granice zaznaczenia do uderzeń, początku taktu, punktów animacji albo klatek źródła. Wyłącz je, gdy potrzebujesz swobodnej korekty.",
  ],
  selection: [
    "IN / OUT",
    "IN to początek zaznaczenia, OUT to koniec. Zaznaczenie służy do pętli i eksportu fragmentu. Shift + przeciągnięcie na osi czasu ustawia obie granice.",
  ],
  sync: [
    "Synchronizacja",
    "Korekta przesuwa wyłącznie obraz względem zegara audio. Dodatnia wartość wyprzedza obraz. Klik i błysk pomagają zmierzyć opóźnienie; punkty utworu pozostają bez zmian.",
  ],
  alpha: [
    "Przezroczystość / alpha",
    "Alpha zapisuje przezroczyste piksele. Wybierz WebM VP9 i przezroczyste tło, żeby położyć alert na grze. MP4 H.264 ma pełne tło.",
  ],
  export: [
    "Powtarzalny eksport",
    "Lokalny proces wylicza każdą klatkę z jej czasu i ziarna, bez nagrywania ekranu. Te same dane i zakres dają te same klatki. Muzykę eksportu dekoduje FFmpeg osobno od przeglądarki.",
  ],
  audio: [
    "Błąd muzyki",
    "Tryb bezgłośny podtrzymuje zegar i pozwala obejrzeć układ. Nie nadaje się do oceny synchronizacji z muzyką. Ponów wczytanie, aby utworzyć nowy kontekst audio i pobrać plik ponownie. Szczegóły zapisują adres, HTTP, bajty i SHA-256.",
  ],
  tier: [
    "Scena z kwoty",
    "Dobiera scenę według istniejących progów donate’ów. Wyłącz, żeby porównywać wybraną scenę na różnych kwotach.",
  ],
  commission: [
    "Prowizja",
    "Kwota i prowizja są przeliczane na grosze. Ustawienia produkcyjne decydują, czy widoczna kwota pomniejsza się o prowizję; Studio zachowuje tę regułę.",
  ],
  emotes: [
    "Emotki w teście",
    "Lokalne próbki emojiBubbly i xdd korzystają z nazw i adresów dostarczonych z pickera Tipply. Produkcja wyświetla obraz, gdy wiadomość zawiera sprawdzone metadane img. Sam shortcode bez metadanych pozostaje tekstem.",
  ],
};
let sequence = 0;
export function Help({ topic }: { topic: keyof typeof topics }) {
  const [visible, setVisible] = useState(false),
    [pinned, setPinned] = useState(false);
  const button = useRef<HTMLButtonElement>(null),
    popup = useRef<HTMLDivElement>(null);
  const id = useRef(`studio-help-${++sequence}`);
  const [title, body] = topics[topic];
  useEffect(() => {
    if (!visible) return;
    const dismiss = (event: PointerEvent) => {
      if (
        !button.current?.contains(event.target as Node) &&
        !popup.current?.contains(event.target as Node)
      ) {
        setVisible(false);
        setPinned(false);
      }
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
        setPinned(false);
        button.current?.focus();
      }
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", key);
    };
  }, [visible]);
  const rect = button.current?.getBoundingClientRect();
  return (
    <>
      <button
        ref={button}
        type="button"
        className="studio-help"
        aria-label={`Pomoc: ${title}`}
        aria-expanded={pinned}
        aria-describedby={visible ? id.current : undefined}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => {
          if (!pinned) setVisible(false);
        }}
        onFocus={() => setVisible(true)}
        onBlur={() => {
          if (!pinned) setVisible(false);
        }}
        onClick={() => {
          setPinned(!pinned);
          setVisible(!pinned);
        }}
      >
        <CircleHelp size={14} />
      </button>
      {visible &&
        createPortal(
          <div
            ref={popup}
            className="studio-help-popup"
            id={id.current}
            role="tooltip"
            style={{
              left: Math.max(12, Math.min((rect?.left ?? 12) - 100, window.innerWidth - 340)),
              top: Math.min((rect?.bottom ?? 20) + 8, window.innerHeight - 180),
            }}
          >
            <strong>{title}</strong>
            <p>{body}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
