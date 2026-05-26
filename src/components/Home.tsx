import { useEffect, useState } from "react";
import type { OverlayWidgetType } from "../routing/parseOverlayRoute";

const pageStyle = {
  boxSizing: "border-box",
  color: "#f5f7fb",
  fontFamily: "sans-serif",
  lineHeight: 1.5,
  maxWidth: 960,
  minHeight: "100vh",
  padding: 24,
} as const;

const linkStyle = {
  color: "#8cc8ff",
} as const;

const panelStyle = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 8,
  marginBottom: 16,
  padding: 16,
} as const;

const sectionStyle = {
  marginTop: 24,
} as const;

const scrollBodyClassName = "home-scroll-enabled";

export const overlayLinkTypes: OverlayWidgetType[] = [
  "ALERTS",
  "TIP_ALERT",
  "REWARD_ALERT",
  "SUB_GOAL",
  "FOLLOW_GOAL",
  "QUEUE",
];

const overlayLegend: Record<OverlayWidgetType, string> = {
  ALERTS: "all alerts",
  TIP_ALERT: "donations/tips only",
  REWARD_ALERT: "Twitch rewards only",
  SUB_GOAL: "subscription goal",
  FOLLOW_GOAL: "follower goal",
  QUEUE: "queue overlay",
};

export const generatorWarning = "Overlay URLs should be treated as private.";

export const generatorLegendItems = [
  ...overlayLinkTypes.map((type) => `${type} - ${overlayLegend[type]}`),
  "test=true - runtime test payloads from backend",
  "fixture - local dev replay",
  "muteAudio=true - silent fixture replay",
];

const fixtureLinkDefinitions: Array<{
  type: OverlayWidgetType;
  fixture: string;
}> = [
  { type: "ALERTS", fixture: "main-donate-prepare" },
  { type: "ALERTS", fixture: "main-donate-html-message" },
  { type: "ALERTS", fixture: "main-donate-without-audio-url" },
  { type: "ALERTS", fixture: "main-roulette-started" },
  { type: "ALERTS", fixture: "main-roulette-flow" },
  { type: "ALERTS", fixture: "main-coinflip-started" },
  { type: "SUB_GOAL", fixture: "subs-set" },
  { type: "FOLLOW_GOAL", fixture: "followers-set" },
  { type: "QUEUE", fixture: "queue-set" },
];

export type OverlayLink = {
  type: OverlayWidgetType;
  description: string;
  normalUrl: string;
  testUrl: string;
};

export type FixtureLink = {
  type: OverlayWidgetType;
  fixture: string;
  url: string;
  mutedUrl: string;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function buildHomeBaseUrl(origin: string, basePath: string): string {
  const normalizedBasePath =
    basePath === "/" ? "" : basePath.replace(/\/+$/, "");

  return `${normalizeBaseUrl(origin)}${normalizedBasePath}`;
}

export function buildOverlayLinks(
  baseUrl: string,
  accountId: string,
): OverlayLink[] {
  const trimmedAccountId = accountId.trim();

  if (!trimmedAccountId) return [];

  const root = normalizeBaseUrl(baseUrl);

  return overlayLinkTypes.map((type) => {
    const normalUrl = `${root}/${type}/${encodeURIComponent(trimmedAccountId)}`;

    return {
      type,
      description: overlayLegend[type],
      normalUrl,
      testUrl: `${normalUrl}?test=true`,
    };
  });
}

export function buildFixtureLinks(
  baseUrl: string,
  accountId: string,
): FixtureLink[] {
  const trimmedAccountId = accountId.trim();

  if (!trimmedAccountId) return [];

  const root = normalizeBaseUrl(baseUrl);
  const encodedAccountId = encodeURIComponent(trimmedAccountId);

  return fixtureLinkDefinitions.map(({ type, fixture }) => {
    const url = `${root}/${type}/${encodedAccountId}?fixture=${encodeURIComponent(fixture)}`;

    return {
      type,
      fixture,
      url,
      mutedUrl: `${url}&muteAudio=true`,
    };
  });
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <p>
      {label}:{" "}
      <a href={url} style={linkStyle}>
        {url}
      </a>
    </p>
  );
}

function useHomePageScroll() {
  useEffect(() => {
    document.body.classList.add(scrollBodyClassName);

    return () => {
      document.body.classList.remove(scrollBodyClassName);
    };
  }, []);
}

export function Home() {
  useHomePageScroll();

  return (
    <main style={pageStyle}>
      <h1>Kaaajka overlay preview</h1>
      <p>
        This frontend serves OBS overlay widgets for the legacy Kaaajka backend.
      </p>
    </main>
  );
}

export function OverlayLinkGenerator() {
  useHomePageScroll();

  const [accountId, setAccountId] = useState("");
  const baseUrl = buildHomeBaseUrl(
    window.location.origin,
    import.meta.env.BASE_URL,
  );
  const links = buildOverlayLinks(baseUrl, accountId);
  const fixtureLinks = buildFixtureLinks(baseUrl, accountId);

  return (
    <main style={pageStyle}>
      <h1>Overlay link generator</h1>
      <p>{generatorWarning}</p>

      <label htmlFor="account-id">Account UUID</label>
      <br />
      <input
        id="account-id"
        type="text"
        value={accountId}
        onChange={(event) => setAccountId(event.currentTarget.value)}
        placeholder="Enter account UUID"
        style={{
          background: "#0f172a",
          border: "1px solid #475569",
          boxSizing: "border-box",
          color: "#f8fafc",
          marginTop: 8,
          padding: 8,
          width: "100%",
        }}
      />

      {links.length > 0 && (
        <section style={sectionStyle}>
          <h2>Runtime overlay links</h2>
          {links.map((link) => (
            <article key={link.type} style={panelStyle}>
              <h3>{link.type}</h3>
              <p>{link.description}</p>
              <LinkRow label="Normal" url={link.normalUrl} />
              <LinkRow label="Test mode" url={link.testUrl} />
            </article>
          ))}
        </section>
      )}

      {fixtureLinks.length > 0 && (
        <section style={sectionStyle}>
          <h2>Fixture QA links</h2>
          {fixtureLinks.map((link) => (
            <article key={`${link.type}:${link.fixture}`} style={panelStyle}>
              <h3>
                {link.type} / {link.fixture}
              </h3>
              <LinkRow label="Fixture" url={link.url} />
              <LinkRow label="Muted fixture" url={link.mutedUrl} />
            </article>
          ))}
        </section>
      )}

      <section style={{ ...panelStyle, ...sectionStyle }}>
        <h2>Legend</h2>
        <ul>
          {generatorLegendItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
