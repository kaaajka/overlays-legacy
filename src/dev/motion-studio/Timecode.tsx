import { useLayoutEffect, useRef, useState } from "react";
import { timecode } from "./studioModel";
export function parseTimecode(value: string): number | undefined {
  const match = /^(?:(\d+):)?(\d{1,2})(?:[.,](\d{1,3}))?$/.exec(value.trim());
  if (!match) return undefined;
  if (match[1] && Number(match[2]) >= 60) return undefined;
  return (
    Number(match[1] ?? 0) * 60 + Number(match[2]) + Number((match[3] ?? "").padEnd(3, "0")) / 1000
  );
}
export function Timecode({
  time,
  seek,
  pause,
}: {
  time: number;
  seek: (at: number) => void;
  pause: () => void;
}) {
  const [editing, setEditing] = useState(false),
    [value, setValue] = useState(""),
    [error, setError] = useState("");
  const cancelled = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);
  const commit = () => {
    if (cancelled.current) return;
    const at = parseTimecode(value);
    if (at === undefined) {
      setError("Wpisz czas, np. 00:12.438");
      return;
    }
    seek(at);
    setEditing(false);
    setError("");
  };
  return (
    <div className="studio-timecode">
      {editing ? (
        <input
          ref={input}
          aria-label="Czas alertu"
          aria-invalid={!!error}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              cancelled.current = true;
              setEditing(false);
              setError("");
            }
            if (e.key === "Tab") commit();
          }}
        />
      ) : (
        <button
          type="button"
          aria-label="Edytuj czas alertu"
          onClick={() => {
            pause();
            cancelled.current = false;
            setValue(timecode(time));
            setEditing(true);
          }}
        >
          {timecode(time)}
        </button>
      )}
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
