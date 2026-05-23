import followersSet from '../fixtures/followers-set.json';
import followersUpdate from '../fixtures/followers-update.json';
import mainAlertListSet from '../fixtures/main-alert-list-set.json';
import mainCoinflipPrepare from '../fixtures/main-coinflip-prepare.json';
import mainCoinflipStarted from '../fixtures/main-coinflip-started.json';
import mainDonatePrepare from '../fixtures/main-donate-prepare.json';
import mainDonateHtmlMessage from '../fixtures/main-donate-html-message.json';
import mainDonateWithoutAudioUrl from '../fixtures/main-donate-without-audio-url.json';
import mainRoulettePrepare from '../fixtures/main-roulette-prepare.json';
import mainRouletteStarted from '../fixtures/main-roulette-started.json';
import queueAdd from '../fixtures/queue-add.json';
import queueDelete from '../fixtures/queue-delete.json';
import queueSet from '../fixtures/queue-set.json';
import subsSet from '../fixtures/subs-set.json';
import subsUpdate from '../fixtures/subs-update.json';

const legacyFixtureMap = {
  'followers-set': followersSet,
  'followers-update': followersUpdate,
  'main-alert-list-set': mainAlertListSet,
  'main-coinflip-prepare': mainCoinflipPrepare,
  'main-coinflip-started': mainCoinflipStarted,
  'main-donate-html-message': mainDonateHtmlMessage,
  'main-donate-prepare': mainDonatePrepare,
  'main-donate-without-audio-url': mainDonateWithoutAudioUrl,
  'main-roulette-prepare': mainRoulettePrepare,
  'main-roulette-started': mainRouletteStarted,
  'queue-add': queueAdd,
  'queue-delete': queueDelete,
  'queue-set': queueSet,
  'subs-set': subsSet,
  'subs-update': subsUpdate,
} as const;

export type LegacyFixtureName = keyof typeof legacyFixtureMap;

export function getLegacyFixture(name: string): unknown | undefined {
  return legacyFixtureMap[name as LegacyFixtureName];
}

export function listLegacyFixtureNames(): LegacyFixtureName[] {
  return Object.keys(legacyFixtureMap) as LegacyFixtureName[];
}
