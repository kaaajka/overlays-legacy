import React from "react";
import ReactDOM from "react-dom";

import { PageChannel } from "./components/PageChannel";
import type { MainOverlayMode } from "./protocol/mainOverlayMode";
import { PageChannelSubs } from "./components/PageChannelSubs";
import { PageChannelFollowers } from "./components/PageChannelFollowers";
import { PageChannelQueue } from "./components/PageChannelQueue";
import { Home } from "./components/Home";
import { NotFound } from "./components/NotFound";
import { parseOverlayRoute } from "./routing/parseOverlayRoute";
import type { OverlayRoute } from "./routing/parseOverlayRoute";
import type { RouterCompatProps } from "./routing/routerCompat";

const routePrefix = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBasePath(pathnameWithSearch: string): string {
  const queryIndex = pathnameWithSearch.indexOf("?");
  const pathname =
    queryIndex === -1
      ? pathnameWithSearch
      : pathnameWithSearch.slice(0, queryIndex);
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

function getMainOverlayMode(
  route: Extract<OverlayRoute, { kind: "overlay" }>,
): MainOverlayMode {
  if (route.type === "ALERTS") return "all";
  if (route.type === "REWARD_ALERT") return "reward";
  return "tip";
}

function renderOverlayRoute(route: OverlayRoute): React.ReactElement {
  if (route.kind === "home") return <Home />;
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
      return (
        <PageChannelSubs {...routerCompatProps} testMode={route.testMode} />
      );
    case "FOLLOW_GOAL":
      return (
        <PageChannelFollowers
          {...routerCompatProps}
          testMode={route.testMode}
        />
      );
    case "QUEUE":
      return (
        <PageChannelQueue {...routerCompatProps} testMode={route.testMode} />
      );
    default:
      return <NotFound />;
  }
}

const overlayRoute = parseOverlayRoute(
  stripBasePath(`${window.location.pathname}${window.location.search}`),
);

ReactDOM.render(
  <React.StrictMode>{renderOverlayRoute(overlayRoute)}</React.StrictMode>,
  document.getElementById("root"),
);
