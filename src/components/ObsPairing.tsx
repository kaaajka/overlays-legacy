import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { AppConfig } from "../config";
import { pairObsSession } from "../socket/obsSession";

export function ObsPairing() {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const leave = () => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.location.reload();
  };

  const pair = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const field = input.current;
    if (pending || !field) return;
    const code = field.value.trim();
    field.value = "";
    setPending(true);
    setFailed(false);
    try {
      await pairObsSession(AppConfig.ws, code);
      leave();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <main style={{ background: "#161616", color: "white", padding: 24 }}>
      <h1>Parowanie alertów OBS</h1>
      <p>Wpisz jednorazowy kod w oknie „Interakcja” tego źródła OBS.</p>
      <form onSubmit={pair}>
        <label htmlFor="obs-code">Kod parowania</label>{" "}
        <input
          id="obs-code"
          ref={input}
          type="password"
          autoComplete="off"
          required
          maxLength={100}
        />{" "}
        <button type="submit" disabled={pending}>
          Połącz
        </button>{" "}
        <button type="button" disabled={pending} onClick={leave}>
          Wróć do nakładki
        </button>
      </form>
      {failed && (
        <p role="alert">
          Parowanie nie powiodło się. Sprawdź dostępność serwera, obsługę ciasteczek i użyj nowego
          kodu.
        </p>
      )}
    </main>
  );
}
