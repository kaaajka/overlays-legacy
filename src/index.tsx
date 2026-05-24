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
import type { RouterCompatProps } from "./routing/routerCompat";

const routePrefix = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBasePath(pathname: string): string {
  if (!routePrefix || routePrefix === "/") return pathname;

  if (pathname === routePrefix) return "/";
  if (pathname.startsWith(`${routePrefix}/`)) {
    return pathname.slice(routePrefix.length) || "/";
  }

  return pathname;
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
  if (route.legacy) return "all";
  if (route.type === "REWARD_ALERT") return "reward";
  return "tip";
}

function renderOverlayRoute(route: OverlayRoute): React.ReactElement {
  if (route.kind === "not_found") return <NotFound />;

  const routerCompatProps = createRouterCompatProps(route.accountId);

  switch (route.type) {
    case "TIP_ALERT":
    case "REWARD_ALERT":
      return <PageChannel {...routerCompatProps} mode={getMainOverlayMode(route)} />;
    case "SUB_GOAL":
      return <PageChannelSubs {...routerCompatProps} />;
    case "FOLLOW_GOAL":
      return <PageChannelFollowers {...routerCompatProps} />;
    case "QUEUE":
      return <PageChannelQueue {...routerCompatProps} />;
    default:
      return <NotFound />;
  }
}

const overlayRoute = parseOverlayRoute(stripBasePath(window.location.pathname));

ReactDOM.render(
  <React.StrictMode>{renderOverlayRoute(overlayRoute)}</React.StrictMode>,
  document.getElementById("root"),
);
