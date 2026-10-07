import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
export function IconButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  pressed,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
    </button>
  );
}
export type MenuAction = { label: string; run: () => void };
export function ContextMenu({
  menu,
  close,
}: {
  menu?: { x: number; y: number; actions: MenuAction[] };
  close: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!menu) return;
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const dismiss = () => closeRef.current();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const buttons = [...ref.current.querySelectorAll("button")];
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[
          (i + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length
        ]?.focus();
      }
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("blur", dismiss);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("blur", dismiss);
      window.removeEventListener("keydown", key);
    };
  }, [menu]);
  if (!menu) return null;
  return (
    <div
      ref={ref}
      className="editor-context-menu"
      role="menu"
      style={{
        left: Math.min(menu.x, window.innerWidth - 220),
        top: Math.min(menu.y, window.innerHeight - menu.actions.length * 30 - 10),
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {menu.actions.map((action) => (
        <button
          type="button"
          role="menuitem"
          key={action.label}
          onClick={() => {
            action.run();
            close();
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
