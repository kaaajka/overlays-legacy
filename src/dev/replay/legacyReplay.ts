import { debugLog } from '../../debug';
import { getLegacyFixture, listLegacyFixtureNames } from './fixtureIndex';

export function isLegacyFixtureReplayEnabled(): boolean {
  return (
    import.meta.env.DEV === true ||
    import.meta.env.VITE_ENABLE_FIXTURE_REPLAY === 'true'
  );
}

export function getRequestedLegacyFixtureName(
  search = window.location.search,
): string | undefined {
  const params = new URLSearchParams(search);
  const fixture = params.get('fixture')?.trim();

  return fixture || undefined;
}


export function isRequestedLegacyFixtureReplayActive(
  search = window.location.search,
): boolean {
  const fixtureName = getRequestedLegacyFixtureName(search);

  return (
    !!fixtureName &&
    isLegacyFixtureReplayEnabled() &&
    !!getLegacyFixture(fixtureName)
  );
}

export function replayRequestedLegacyFixture(
  handlePayload: (payload: unknown) => void,
  search = window.location.search,
): boolean {
  const fixtureName = getRequestedLegacyFixtureName(search);
  if (!fixtureName) return false;

  if (!isLegacyFixtureReplayEnabled()) {
    debugLog('Legacy fixture replay ignored outside dev mode', fixtureName);
    return false;
  }

  const fixture = getLegacyFixture(fixtureName);
  if (!fixture) {
    debugLog('Unknown legacy fixture replay name', {
      fixtureName,
      availableFixtures: listLegacyFixtureNames(),
    });
    return false;
  }

  window.setTimeout(() => {
    handlePayload(fixture);
  }, 0);

  return true;
}
