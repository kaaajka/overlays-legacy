import { useState } from 'react';
import type { OverlayWidgetType } from '../routing/parseOverlayRoute';

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
  const [accountId, setAccountId] = useState('');
  const baseUrl = buildHomeBaseUrl(
    window.location.origin,
    import.meta.env.BASE_URL,
  );
  const links = buildOverlayLinks(baseUrl, accountId);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 960 }}>
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
          boxSizing: 'border-box',
          marginTop: 8,
          padding: 8,
          width: '100%',
        }}
      />

      {links.length > 0 && (
        <section>
          <h2>Generated links</h2>
          {links.map((link) => (
            <article key={link.type} style={{ marginBottom: 16 }}>
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

      <section>
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
