import {
  resolveCoinflipPrepareSoundUrl,
  resolveRewardRandomSoundUrl,
} from "../assets/resolveOverlayAssetUrl";

export type PrepareSoundSource = string | readonly string[] | null | undefined;

export type ResolvePrepareSoundUrlOptions = {
  random?: () => number;
  soundsByKey?: Record<string, unknown>;
  defaultSounds?: unknown;
};

const randomSounds = [
  resolveRewardRandomSoundUrl(1),
  resolveRewardRandomSoundUrl(2),
  resolveRewardRandomSoundUrl(3),
  resolveRewardRandomSoundUrl(4),
  resolveRewardRandomSoundUrl(5),
  resolveRewardRandomSoundUrl(6),
  resolveRewardRandomSoundUrl(7),
  resolveRewardRandomSoundUrl(8),
  resolveRewardRandomSoundUrl(9),
  resolveRewardRandomSoundUrl(10),
  resolveRewardRandomSoundUrl(11),
];

const defaultPrepareSoundsByKey: Record<string, PrepareSoundSource> = {
  dogs: [
    randomSounds[2],
    randomSounds[4],
    randomSounds[5],
    randomSounds[6],
    randomSounds[7],
    randomSounds[8],
    randomSounds[9],
    randomSounds[10],
  ],
  coinflip: [
    resolveCoinflipPrepareSoundUrl(1),
    resolveCoinflipPrepareSoundUrl(2),
    resolveCoinflipPrepareSoundUrl(3),
    resolveCoinflipPrepareSoundUrl(4),
  ],
};

function resolveSoundSource(source: unknown, random: () => number): string | undefined {
  if (typeof source === "string") return source;
  if (!Array.isArray(source)) return undefined;

  const index = Math.floor(random() * source.length);
  const sound = source[index];

  return typeof sound === "string" ? sound : undefined;
}

export function resolvePrepareSoundUrl(
  key: unknown,
  {
    random = Math.random,
    soundsByKey = defaultPrepareSoundsByKey,
    defaultSounds = randomSounds,
  }: ResolvePrepareSoundUrlOptions = {},
): string | undefined {
  const source =
    typeof key === "string" && Object.hasOwn(soundsByKey, key)
      ? soundsByKey[key]
      : defaultSounds;

  return resolveSoundSource(source, random);
}
