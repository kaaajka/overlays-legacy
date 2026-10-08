import { pl } from "./polish";
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelGroupHandle, ImperativePanelHandle } from "react-resizable-panels";
import { Maximize2, Minimize2 } from "lucide-react";
import { IconButton } from "./editorControls";
export type PanelName = "tree" | "stage" | "inspector" | "timeline";
const titles = {
  tree: "Scene tree",
  stage: "Program · 1920 × 1080",
  inspector: "Properties",
  timeline: "Timeline",
};
const defaults = { horizontal: [14, 64, 22], vertical: [62, 38] };
function storedLayout() {
  try {
    const value = JSON.parse(localStorage.getItem("kaaajka-studio-workspace-2.1"));
    if (
      value?.horizontal?.length === 3 &&
      value?.vertical?.length === 2 &&
      [...value.horizontal, ...value.vertical].every(
        (n) => Number.isFinite(n) && n >= 0 && n <= 100,
      )
    )
      return value;
  } catch {
    /* A corrupt preference must never block the editor. */
  }
  return defaults;
}
export type WorkspaceHandle = {
  toggleLeft: () => void;
  toggleRight: () => void;
  maximize: () => void;
  restore: () => void;
  reset: () => void;
  layout: () => { horizontal: number[]; vertical: number[] };
};
export const Workspace = forwardRef<
  WorkspaceHandle,
  {
    tree: React.ReactNode;
    stage: React.ReactNode;
    inspector: React.ReactNode;
    timeline: React.ReactNode;
    active: PanelName;
    setActive: (panel: PanelName) => void;
    onMaximized: (panel?: PanelName) => void;
  }
>((props, ref) => {
  const initial = useRef(storedLayout());
  const h = useRef<ImperativePanelGroupHandle>(null),
    v = useRef<ImperativePanelGroupHandle>(null);
  const left = useRef<ImperativePanelHandle>(null),
    right = useRef<ImperativePanelHandle>(null);
  const saved = useRef(initial.current);
  const snapshot = useRef<typeof defaults>();
  const [maximized, setMaximized] = useState<PanelName>();
  const maxRef = useRef<PanelName>();
  const read = () => ({
    horizontal: h.current?.getLayout() ?? saved.current.horizontal,
    vertical: v.current?.getLayout() ?? saved.current.vertical,
  });
  const restore = () => {
    maxRef.current = undefined;
    setMaximized(undefined);
    props.onMaximized(undefined);
  };
  const maximize = (name = props.active) => {
    if (maxRef.current) {
      restore();
      return;
    }
    snapshot.current = read();
    maxRef.current = name;
    setMaximized(name);
    props.onMaximized(name);
  };
  useLayoutEffect(() => {
    if (maximized) {
      h.current?.setLayout(
        maximized === "tree" ? [100, 0, 0] : maximized === "inspector" ? [0, 0, 100] : [0, 100, 0],
      );
      v.current?.setLayout(maximized === "timeline" ? [0, 100] : [100, 0]);
    } else if (snapshot.current) {
      h.current?.setLayout(snapshot.current.horizontal);
      v.current?.setLayout(snapshot.current.vertical);
      snapshot.current = undefined;
    }
  }, [maximized]);
  const persist = (axis: "horizontal" | "vertical", sizes: number[]) => {
    if (maxRef.current || snapshot.current) return;
    saved.current = { ...saved.current, [axis]: sizes };
    try {
      localStorage.setItem("kaaajka-studio-workspace-2.1", JSON.stringify(saved.current));
    } catch {
      /* Local persistence is optional. */
    }
  };
  useImperativeHandle(ref, () => ({
    toggleLeft: () => {
      if (maxRef.current) return;
      left.current?.isCollapsed() ? left.current.expand() : left.current?.collapse();
    },
    toggleRight: () => {
      if (maxRef.current) return;
      right.current?.isCollapsed() ? right.current.expand() : right.current?.collapse();
    },
    maximize: () => maximize(),
    restore,
    reset: () => {
      const wasMaximized = Boolean(maxRef.current);
      restore();
      snapshot.current = defaults;
      saved.current = defaults;
      h.current?.setLayout(defaults.horizontal);
      v.current?.setLayout(defaults.vertical);
      if (!wasMaximized) snapshot.current = undefined;
      try {
        localStorage.removeItem("kaaajka-studio-workspace-2.1");
      } catch {
        /* optional */
      }
    },
    layout: read,
  }));
  const panel = (name: PanelName, children: React.ReactNode) => (
    <section
      className={`docked-panel ${props.active === name ? "active-panel" : ""}`}
      data-panel={name}
      onPointerDownCapture={() => props.setActive(name)}
      onFocusCapture={() => props.setActive(name)}
    >
      <header className="dock-header">
        <span>{pl(titles[name])}</span>
        <IconButton
          icon={maximized ? Minimize2 : Maximize2}
          label={maximized ? "Restore workspace" : `Powiększ ${pl(titles[name])}`}
          shortcut="Ctrl+Shift+M"
          onClick={() => maximize(name)}
        />
      </header>
      {children}
    </section>
  );
  return (
    <div className={`editor-workspace ${maximized ? `maximized-${maximized}` : ""}`}>
      <PanelGroup direction="vertical" ref={v} onLayout={(sizes) => persist("vertical", sizes)}>
        <Panel
          id="program-dock"
          order={1}
          defaultSize={initial.current.vertical[0]}
          minSize={maximized ? 0 : 25}
        >
          <PanelGroup
            direction="horizontal"
            ref={h}
            onLayout={(sizes) => persist("horizontal", sizes)}
          >
            <Panel
              id="tree-dock"
              order={1}
              ref={left}
              defaultSize={initial.current.horizontal[0]}
              minSize={maximized ? 0 : 10}
              maxSize={maximized ? 100 : 30}
              collapsible
              collapsedSize={0}
            >
              {panel("tree", props.tree)}
            </Panel>
            <PanelResizeHandle
              className="dock-divider horizontal"
              aria-label={pl("Resize Scene Tree")}
              onDoubleClick={() => left.current?.resize(14)}
            />
            <Panel
              id="stage-dock"
              order={2}
              defaultSize={initial.current.horizontal[1]}
              minSize={maximized ? 0 : 30}
            >
              {panel("stage", props.stage)}
            </Panel>
            <PanelResizeHandle
              className="dock-divider horizontal"
              aria-label={pl("Resize Inspector")}
              onDoubleClick={() => right.current?.resize(22)}
            />
            <Panel
              id="inspector-dock"
              order={3}
              ref={right}
              defaultSize={initial.current.horizontal[2]}
              minSize={maximized ? 0 : 16}
              maxSize={maximized ? 100 : 40}
              collapsible
              collapsedSize={0}
            >
              {panel("inspector", props.inspector)}
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle
          className="dock-divider vertical"
          aria-label={pl("Resize Timeline")}
          onDoubleClick={() => v.current?.setLayout(defaults.vertical)}
        />
        <Panel
          id="timeline-dock"
          order={2}
          defaultSize={initial.current.vertical[1]}
          minSize={maximized ? 0 : 20}
        >
          {panel("timeline", props.timeline)}
        </Panel>
      </PanelGroup>
    </div>
  );
});
