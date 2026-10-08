import React from "react";
import ReactDOM from "react-dom";
import "animate.css";

import { PageChannel } from "./components/PageChannel";
import type { MainOverlayMode } from "./protocol/mainOverlayMode";
import { PageChannelSubs } from "./components/PageChannelSubs";
import { PageChannelFollowers } from "./components/PageChannelFollowers";
import { PageChannelQueue } from "./components/PageChannelQueue";
import { Home, OverlayLinkGenerator } from "./components/Home";
import { NotFound } from "./components/NotFound";
import { parseOverlayRoute } from "./routing/parseOverlayRoute";
import type { OverlayRoute } from "./routing/parseOverlayRoute";
import type { RouterCompatProps } from "./routing/routerCompat";

const routePrefix = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBasePath(pathnameWithSearch: string): string {
  const queryIndex = pathnameWithSearch.indexOf("?");
  const pathname = queryIndex === -1 ? pathnameWithSearch : pathnameWithSearch.slice(0, queryIndex);
  const search = queryIndex === -1 ? "" : pathnameWithSearch.slice(queryIndex);

  if (!routePrefix || routePrefix === "/") return pathnameWithSearch;

  if (pathname === routePrefix) return `/${search}`;
  if (pathname.startsWith(`${routePrefix}/`)) {
    return `${pathname.slice(routePrefix.length) || "/"}${search}`;
  }

  return pathnameWithSearch;
}

function createRouterCompatProps(accountId: string): RouterCompatProps {
  return {
    match: {
      params: {
        id: accountId,
      },
    },
  };
}

function getMainOverlayMode(route: Extract<OverlayRoute, { kind: "overlay" }>): MainOverlayMode {
  if (route.type === "ALERTS") return "all";
  if (route.type === "REWARD_ALERT") return "reward";
  return "tip";
}

function renderOverlayRoute(route: OverlayRoute): React.ReactElement {
  if (route.kind === "home") return <Home />;
  if (route.kind === "generator") return <OverlayLinkGenerator />;
  if (route.kind === "not_found") return <NotFound />;

  const routerCompatProps = createRouterCompatProps(route.accountId);

  switch (route.type) {
    case "ALERTS":
    case "TIP_ALERT":
    case "REWARD_ALERT":
      return (
        <PageChannel
          {...routerCompatProps}
          mode={getMainOverlayMode(route)}
          testMode={route.testMode}
        />
      );
    case "SUB_GOAL":
      return <PageChannelSubs {...routerCompatProps} testMode={route.testMode} />;
    case "FOLLOW_GOAL":
      return <PageChannelFollowers {...routerCompatProps} testMode={route.testMode} />;
    case "QUEUE":
      return <PageChannelQueue {...routerCompatProps} testMode={route.testMode} />;
    default:
      return <NotFound />;
  }
}

const overlayRoute = parseOverlayRoute(
  stripBasePath(`${window.location.pathname}${window.location.search}`),
);

const Studio = React.lazy(() => import("./dev/motion-studio/MotionStudio"));
const isStudio = stripBasePath(window.location.pathname) === "/motion-studio";

class StudioShellBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Motion Studio shell could not load", error);
  }
  render() {
    return this.state.failed ? (
      <main
        style={{
          position: "fixed",
          inset: 0,
          padding: 32,
          color: "#eef0f3",
          background: "#17191d",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Motion Studio</h1>
        <p>Usługi lokalne są niedostępne. Nie udało się wczytać edytora.</p>
        <p>Uruchom lokalny serwer, aby przygotowywać czytanie, eksportować i zapisywać.</p>
        <button type="button" onClick={() => location.reload()}>
          Ponów wczytanie
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    {isStudio ? (
      <StudioShellBoundary>
        <React.Suspense fallback={<p>Wczytywanie Motion Studio…</p>}>
          <Studio />
        </React.Suspense>
      </StudioShellBoundary>
    ) : (
      renderOverlayRoute(overlayRoute)
    )}
  </React.StrictMode>,
  document.getElementById("root"),
);
