import { pl } from "./polish";
import { useCallback, useEffect, useRef, useState } from "react";
import { Scan, ImagePlus } from "lucide-react";
import { IconButton, ContextMenu } from "./editorControls";
import type { MenuAction } from "./editorControls";
const presets = [
  [1280, 720],
  [1366, 768],
  [1920, 1080],
  [2560, 1440],
  [3840, 2160],
  [1920, 1200],
  [2560, 1080],
  [3440, 1440],
  [3840, 1080],
  [5120, 1440],
];
export default function ProgramMonitor({
  children,
  background,
  setBackground,
  onCustom,
  output,
  setOutput,
}: {
  children: React.ReactNode;
  output: { width: number; height: number };
  setOutput: (value: { width: number; height: number }) => void;
  background: string;
  setBackground: (value: string) => void;
  onCustom: (file: File) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [customFormat, setCustomFormat] = useState(false);
  const [zoom, setZoom] = useState("fit");
  const [menu, setMenu] = useState<{ x: number; y: number; actions: MenuAction[] }>();
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  const scale =
    zoom === "fit"
      ? Math.min(size.width / output.width, size.height / output.height)
      : Number(zoom);
  const center = () => {
    viewport.current.scrollLeft = (viewport.current.scrollWidth - viewport.current.clientWidth) / 2;
    viewport.current.scrollTop =
      (viewport.current.scrollHeight - viewport.current.clientHeight) / 2;
  };
  const zoomAt = useCallback(
    (next: number, x = size.width / 2, y = size.height / 2) => {
      const host = viewport.current;
      const oldW = output.width * scale,
        oldH = output.height * scale;
      const px = (host.scrollLeft + x - Math.max(0, (size.width - oldW) / 2)) / scale;
      const py = (host.scrollTop + y - Math.max(0, (size.height - oldH) / 2)) / scale;
      const bounded = Math.max(0.1, Math.min(4, next));
      setZoom(String(bounded));
      requestAnimationFrame(() => {
        host.scrollLeft = px * bounded + Math.max(0, (size.width - output.width * bounded) / 2) - x;
        host.scrollTop =
          py * bounded + Math.max(0, (size.height - output.height * bounded) / 2) - y;
      });
    },
    [scale, size.width, size.height, output.width, output.height],
  );
  useEffect(() => {
    const host = viewport.current;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const rect = host.getBoundingClientRect();
        zoomAt(
          scale * Math.exp(-event.deltaY * 0.002),
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      } else if (event.shiftKey) {
        event.preventDefault();
        host.scrollLeft += event.deltaY + event.deltaX;
      }
    };
    host.addEventListener("wheel", wheel, { passive: false });
    return () => host.removeEventListener("wheel", wheel);
  }, [scale, zoomAt]);
  const drag = useRef<{ x: number; y: number; left: number; top: number }>();
  return (
    <div className="program-monitor">
      <div className="viewer-tools">
        <label>
          {pl("View")}
          <select
            aria-label={pl("Viewer zoom")}
            value={zoom}
            onChange={(event) =>
              event.target.value === "fit" ? setZoom("fit") : zoomAt(Number(event.target.value))
            }
          >
            <option value="fit">{pl("Fit")}</option>
            {[
              ...new Set([
                0.1,
                0.25,
                0.5,
                0.75,
                1,
                2,
                4,
                ...(zoom !== "fit" ? [Number(zoom)] : []),
              ]),
            ]
              .sort((a, b) => a - b)
              .map((value) => (
                <option key={value} value={value}>
                  {Math.round(value * 100)}%
                </option>
              ))}
          </select>
        </label>
        <label>
          Format podglądu
          <select
            aria-label="Format podglądu"
            value={
              !customFormat && presets.some((p) => p[0] === output.width && p[1] === output.height)
                ? output.width + "x" + output.height
                : "custom"
            }
            onChange={(e) => {
              if (e.target.value === "custom") {
                setCustomFormat(true);
                return;
              }
              setCustomFormat(false);
              const [width, height] = e.target.value.split("x").map(Number);
              setOutput({ width, height });
            }}
          >
            {presets.map(([width, height]) => (
              <option key={width + "x" + height} value={width + "x" + height}>
                {width}×{height}
              </option>
            ))}
            <option value="custom">Własny</option>
          </select>
        </label>
        <label>
          Szerokość
          <input
            aria-label="Szerokość formatu"
            type="number"
            min="320"
            max="8192"
            step="2"
            value={output.width}
            onChange={(e) => {
              const width = Number(e.target.value);
              if (width >= 320 && width <= 8192 && width % 2 === 0) setOutput({ ...output, width });
            }}
          />
        </label>
        <label>
          Wysokość
          <input
            aria-label="Wysokość formatu"
            type="number"
            min="240"
            max="4320"
            step="2"
            value={output.height}
            onChange={(e) => {
              const height = Number(e.target.value);
              if (height >= 240 && height <= 4320 && height % 2 === 0)
                setOutput({ ...output, height });
            }}
          />
        </label>
        <IconButton icon={Scan} label={pl("Center viewer")} onClick={center} />
        <label>
          {pl("Background")}
          <select
            id="studio-background"
            aria-label={pl("Stage background")}
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          >
            {["stream", "checker", "solid", "transparent"].map((value) => (
              <option value={value} key={value}>
                {value === "stream" ? "Podgląd streama" : pl(value)}
              </option>
            ))}
          </select>
        </label>
        <IconButton
          icon={ImagePlus}
          label={pl("Custom stream frame")}
          onClick={() => file.current.click()}
        />
        <input
          ref={file}
          className="file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label={pl("Custom stream image")}
          onChange={(event) => {
            if (event.target.files[0]) onCustom(event.target.files[0]);
            event.target.value = "";
          }}
        />
      </div>
      <div
        className="viewer-viewport"
        role="application"
        aria-label={pl("Program monitor")}
        ref={viewport}
        onDragStart={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const image = [...event.dataTransfer.files].find((file) =>
            file.type.startsWith("image/"),
          );
          if (image) onCustom(image);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenu({
            x: event.clientX,
            y: event.clientY,
            actions: [
              ...["fit", "0.5", "1"].map((value) => ({
                label: value === "fit" ? "Dopasuj" : `${Number(value) * 100}%`,
                run: () => (value === "fit" ? setZoom(value) : zoomAt(Number(value))),
              })),
              { label: "Wyśrodkuj podgląd", run: center },
              ...["stream", "checker", "transparent"].map((value) => ({
                label: value === "stream" ? "Podgląd streama" : pl(value),
                run: () => setBackground(value),
              })),
            ],
          });
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || zoom === "fit") return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            left: viewport.current.scrollLeft,
            top: viewport.current.scrollTop,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current) {
            viewport.current.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
            viewport.current.scrollTop = drag.current.top - (event.clientY - drag.current.y);
          }
        }}
        onPointerUp={() => {
          drag.current = undefined;
        }}
        onPointerCancel={() => {
          drag.current = undefined;
        }}
      >
        <div
          className="viewer-surface"
          style={{
            width: Math.max(size.width, output.width * scale),
            height: Math.max(size.height, output.height * scale),
          }}
        >
          <div
            className="stage-frame"
            data-scale={scale}
            style={{ width: output.width * scale, height: output.height * scale }}
          >
            <div className="stage-scale">{children}</div>
          </div>
        </div>
      </div>
      <ContextMenu menu={menu} close={() => setMenu(undefined)} />
    </div>
  );
}
