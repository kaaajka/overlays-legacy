import { useEffect, useRef, useState } from "react";
import { Scan, ImagePlus } from "lucide-react";
import { IconButton, ContextMenu } from "./editorControls";
import type { MenuAction } from "./editorControls";
export default function ProgramMonitor({
  children,
  background,
  setBackground,
  onCustom,
}: {
  children: React.ReactNode;
  background: string;
  setBackground: (value: string) => void;
  onCustom: (file: File) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState("fit");
  const [menu, setMenu] = useState<{ x: number; y: number; actions: MenuAction[] }>();
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  const scale = zoom === "fit" ? Math.min(size.width / 1920, size.height / 1080) : Number(zoom);
  const center = () => {
    viewport.current.scrollLeft = (viewport.current.scrollWidth - viewport.current.clientWidth) / 2;
    viewport.current.scrollTop =
      (viewport.current.scrollHeight - viewport.current.clientHeight) / 2;
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: Recenter only when the fitted/manual scale changes.
  useEffect(() => {
    center();
  }, [scale]);
  const drag = useRef<{ x: number; y: number; left: number; top: number }>();
  return (
    <div className="program-monitor">
      <div className="viewer-tools">
        <label>
          View
          <select
            aria-label="Viewer zoom"
            value={zoom}
            onChange={(event) => setZoom(event.target.value)}
          >
            <option value="fit">Fit</option>
            {[0.25, 0.5, 0.75, 1].map((value) => (
              <option key={value} value={value}>
                {value * 100}%
              </option>
            ))}
          </select>
        </label>
        <IconButton icon={Scan} label="Center viewer" onClick={center} />
        <label>
          Background
          <select
            id="studio-background"
            aria-label="Stage background"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          >
            {["stream", "checker", "solid", "transparent"].map((value) => (
              <option value={value} key={value}>
                {value === "stream" ? "Stream preview" : value}
              </option>
            ))}
          </select>
        </label>
        <IconButton
          icon={ImagePlus}
          label="Custom stream frame"
          onClick={() => file.current.click()}
        />
        <input
          ref={file}
          className="file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Custom stream image"
          onChange={(event) => {
            if (event.target.files[0]) onCustom(event.target.files[0]);
            event.target.value = "";
          }}
        />
      </div>
      <div
        className="viewer-viewport"
        role="application"
        aria-label="Program monitor"
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
                label: value === "fit" ? "Fit" : `${Number(value) * 100}%`,
                run: () => setZoom(value),
              })),
              { label: "Center", run: center },
              ...["stream", "checker", "transparent"].map((value) => ({
                label: value === "stream" ? "Stream Preview" : value,
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
            width: Math.max(size.width, 1920 * scale),
            height: Math.max(size.height, 1080 * scale),
          }}
        >
          <div
            className="stage-frame"
            data-scale={scale}
            style={{ width: 1920 * scale, height: 1080 * scale }}
          >
            <div className="stage-scale">{children}</div>
          </div>
        </div>
      </div>
      <ContextMenu menu={menu} close={() => setMenu(undefined)} />
    </div>
  );
}
