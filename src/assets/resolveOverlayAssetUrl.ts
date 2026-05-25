export function joinPublicAssetPath(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl === "/" ? "" : baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

export function resolvePublicAssetUrl(path: string): string {
  return joinPublicAssetPath(import.meta.env.BASE_URL, path);
}

export function resolveRouletteImageUrl(filename: string): string {
  return resolvePublicAssetUrl(`assets/images/roulette/${filename}`);
}

export function resolveCoinflipImageUrl(side: "head" | "tail"): string {
  return resolvePublicAssetUrl(`assets/images/coinflip/${side}.png`);
}

export function resolveDonationAudioUrl(filename: string): string {
  return resolvePublicAssetUrl(`media/audio/${filename}`);
}

export function resolveDonationGifUrl(filename: string): string {
  return resolvePublicAssetUrl(`media/gif/${filename}`);
}
