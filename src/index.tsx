import React from "react";
import ReactDOM from "react-dom";

import { PageChannel } from "./components/PageChannel";
import type { MainOverlayMode } from "./protocol/mainOverlayMode";
import { PageChannelSubs } from "./components/PageChannelSubs";
import { PageChannelFollowers } from "./components/PageChannelFollowers";
import { PageChannelQueue } from "./components/PageChannelQueue";
import { NotFound } from "./components/NotFound";
import { parseOverlayRoute } from "./routing/parseOverlayRoute";
import type { OverlayRoute } from "./routing/parseOverlayRoute";
import type { OverlayRouteProps } from "./routing/overlayRouteProps";

const routePrefix = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBasePath(pathname: string): string {
  if (!routePrefix || routePrefix === "/") return pathname;

  if (pathname === routePrefix) return "/";
  if (pathname.startsWith(`${routePrefix}/`)) {
    return pathname.slice(routePrefix.length) || "/";
  }

  return pathname;
}

function createOverlayRouteProps(accountId: string): OverlayRouteProps {
  return { accountId };
}

function getMainOverlayMode(route: Extract<OverlayRoute, { kind: "overlay" }>): MainOverlayMode {
  if (route.legacy || route.type === "ALERTS") return "all";
  if (route.type === "REWARD_ALERT") return "reward";
  return "tip";
}

function renderOverlayRoute(route: OverlayRoute): React.ReactElement {
  if (route.kind === "not_found") return <NotFound />;

  const overlayRouteProps = createOverlayRouteProps(route.accountId);

  switch (route.type) {
    case "ALERTS":
    case "TIP_ALERT":
    case "REWARD_ALERT":
      return <PageChannel {...overlayRouteProps} mode={getMainOverlayMode(route)} />;
    case "SUB_GOAL":
      return <PageChannelSubs {...overlayRouteProps} />;
    case "FOLLOW_GOAL":
      return <PageChannelFollowers {...overlayRouteProps} />;
    case "QUEUE":
      return <PageChannelQueue {...overlayRouteProps} />;
    default:
      return <NotFound />;
  }
}

const overlayRoute = parseOverlayRoute(stripBasePath(window.location.pathname));

ReactDOM.render(
  <React.StrictMode>{renderOverlayRoute(overlayRoute)}</React.StrictMode>,
  document.getElementById("root"),
);
