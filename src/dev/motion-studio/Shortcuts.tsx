import { useLayoutEffect, useRef } from "react";
export function Shortcuts({ close }: { close: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement;
    root.current.querySelector<HTMLButtonElement>("button").focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
    };
    window.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("keydown", key, true);
      previous?.focus();
    };
  }, [close]);
  return (
    <div className="studio-modal-backdrop">
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="studio-shortcuts"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            close();
          }
          if (e.key === "Tab") {
            const buttons = [...root.current.querySelectorAll<HTMLButtonElement>("button")];
            if (buttons.length === 1) {
              e.preventDefault();
              buttons[0].focus();
            }
          }
        }}
      >
        <h2 id="shortcuts-title">Skróty klawiszowe</h2>
        <dl>
          {[
            ["Spacja", "Odtwórz / pauza"],
            ["Home", "Od początku"],
            ["← / →", "Przesuń o 10 ms"],
            ["Shift + ← / →", "Przesuń o 50 ms"],
            ["↑ / ↓", "Poprzedni / następny punkt"],
            ["Ctrl + Shift + L", "Pokaż / ukryj warstwy"],
            ["Ctrl + Shift + R", "Pokaż / ukryj inspektor"],
            ["Ctrl + Shift + M", "Powiększ aktywny panel"],
            ["Ctrl/Cmd + kółko", "Powiększ oś lub podgląd pod wskaźnikiem"],
            ["Shift + kółko", "Przewiń poziomo"],
            ["? / Shift + /", "Skróty klawiszowe"],
          ].map(([key, label]) => (
            <div key={key}>
              <dt>
                <kbd>{key}</kbd>
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={close}>
          Zamknij
        </button>
      </div>
    </div>
  );
}
