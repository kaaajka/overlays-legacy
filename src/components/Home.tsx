import { useState } from 'react';
import type { OverlayWidgetType } from '../routing/parseOverlayRoute';

const pageStyle = {
  color: '#f5f7fb',
  fontFamily: 'sans-serif',
  lineHeight: 1.5,
  maxWidth: 960,
  padding: 24,
} as const;

const linkStyle = {
  color: '#8cc8ff',
} as const;

const panelStyle = {
  background: '#111827',
  border: '1px solid #334155',
  borderRadius: 8,
  marginBottom: 16,
  padding: 16,
} as const;

export const overlayLinkTypes: OverlayWidgetType[] = [
  'ALERTS',
  'TIP_ALERT',
  'REWARD_ALERT',
  'SUB_GOAL',
  'FOLLOW_GOAL',
  'QUEUE',
];

const overlayLegend: Record<OverlayWidgetType, string> = {
  ALERTS: 'all alerts',
  TIP_ALERT: 'donations/tips only',
  REWARD_ALERT: 'Twitch rewards only',
  SUB_GOAL: 'subscription goal',
  FOLLOW_GOAL: 'follower goal',
  QUEUE: 'queue overlay',
};

export type OverlayLink = {
  type: OverlayWidgetType;
  description: string;
  normalUrl: string;
  testUrl: string;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export function buildHomeBaseUrl(origin: string, basePath: string): string {
  const normalizedBasePath =
    basePath === '/' ? '' : basePath.replace(/\/+$/, '');

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

export function Home() {
  const generateUrl = `${buildHomeBaseUrl(window.location.origin, import.meta.env.BASE_URL)}/generate`;

  return (
    <main style={pageStyle}>
      <h1>Kaaajka overlay preview</h1>
      <p>
        This frontend serves OBS overlay widgets for the legacy Kaaajka backend.
      </p>
      <p>
        Use the generator to create private overlay URLs for a specific account.
      </p>
      <p>
        <a href={generateUrl} style={linkStyle}>
          Open overlay link generator
        </a>
      </p>
    </main>
  );
}

export function OverlayLinkGenerator() {
  const [accountId, setAccountId] = useState('');
  const baseUrl = buildHomeBaseUrl(
    window.location.origin,
    import.meta.env.BASE_URL,
  );
  const links = buildOverlayLinks(baseUrl, accountId);

  return (
    <main style={pageStyle}>
      <h1>Overlay link generator</h1>
      <p>Overlay URLs should not be shown publicly.</p>

      <label htmlFor="account-id">Account UUID</label>
      <br />
      <input
        id="account-id"
        type="text"
        value={accountId}
        onChange={(event) => setAccountId(event.currentTarget.value)}
        placeholder="Enter account UUID"
        style={{
          background: '#0f172a',
          border: '1px solid #475569',
          boxSizing: 'border-box',
          color: '#f8fafc',
          marginTop: 8,
          padding: 8,
          width: '100%',
        }}
      />

      {links.length > 0 && (
        <section>
          <h2>Generated links</h2>
          {links.map((link) => (
            <article key={link.type} style={panelStyle}>
              <h3>{link.type}</h3>
              <p>{link.description}</p>
              <p>
                Normal: <code>{link.normalUrl}</code>
              </p>
              <p>
                Test: <code>{link.testUrl}</code>
              </p>
            </article>
          ))}
        </section>
      )}

      <section style={panelStyle}>
        <h2>Legend</h2>
        <ul>
          {overlayLinkTypes.map((type) => (
            <li key={type}>
              {type} - {overlayLegend[type]}
            </li>
          ))}
          <li>?test=true - test mode, accepts only test event names</li>
        </ul>
      </section>
    </main>
  );
}
