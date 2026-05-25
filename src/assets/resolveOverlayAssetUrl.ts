export function joinPublicAssetPath(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl === "/" ? "" : baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

export function resolvePublicAssetUrl(path: string): string {
  return joinPublicAssetPath(import.meta.env.BASE_URL, path);
}

const legacyRewardImageFilenameMap: Record<string, string> = {
  "credits_1k.png": "credits-1k.png",
  "credits_5k.png": "credits-5k.png",
  "credits_10k.png": "credits-10k.png",
  "credits_50k.png": "credits-50k.png",
  "credits_100k.png": "credits-100k.png",
  "fast_3k.png": "fast-3k.png",
  "randomGame.png": "random-game.png",
  "psc20.png": "psc-20.png",
  "multilottery_30k.png": "multi-lottery-30k.png",
};

function normalizeSequentialAssetIndex(index: number): string {
  if (!Number.isInteger(index) || index < 1) {
    throw new Error(`Invalid overlay asset index: ${index}`);
  }

  return String(index).padStart(2, "0");
}

export function resolveRewardImageUrl(filename: string): string {
  const canonicalFilename = legacyRewardImageFilenameMap[filename] ?? filename;

  return resolvePublicAssetUrl(`assets/images/rewards/${canonicalFilename}`);
}

export function resolveRouletteImageUrl(filename: string): string {
  return resolveRewardImageUrl(filename);
}

export function resolveCoinflipImageUrl(side: "head" | "tail"): string {
  return resolvePublicAssetUrl(`assets/images/coinflip/${side}.png`);
}

export function resolveGoalImageUrl(name: "kaaajk4-love"): string {
  return resolvePublicAssetUrl(`assets/images/goals/${name}.png`);
}

export function resolveRewardRandomSoundUrl(index: number): string {
  return resolvePublicAssetUrl(
    `assets/sounds/rewards/random/random-${normalizeSequentialAssetIndex(index)}.mp3`,
  );
}

export function resolveCoinflipPrepareSoundUrl(index: number): string {
  return resolvePublicAssetUrl(
    `assets/sounds/rewards/coinflip/coinflip-prepare-${normalizeSequentialAssetIndex(index)}.mp3`,
  );
}

export function resolveSharedEventSoundUrl(name: "spinning" | "win"): string {
  return resolvePublicAssetUrl(`assets/sounds/shared/${name}.mp3`);
}

export function resolveDonationAudioUrl(templateIndex: number): string {
  const extension = templateIndex === 5 || templateIndex === 7 ? "mp3" : "mpga";

  return resolvePublicAssetUrl(
    `assets/donations/audio/donation-template-${normalizeSequentialAssetIndex(templateIndex)}.${extension}`,
  );
}

export function resolveDonationGifUrl(templateIndex: number): string {
  return resolvePublicAssetUrl(
    `assets/donations/gif/donation-template-${normalizeSequentialAssetIndex(templateIndex)}.gif`,
  );
}
