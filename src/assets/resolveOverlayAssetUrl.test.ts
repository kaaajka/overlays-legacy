import { describe, expect, it } from "vitest";
import {
  joinPublicAssetPath,
  resolveCoinflipImageUrl,
  resolveCoinflipPrepareSoundUrl,
  resolveDonationAudioUrl,
  resolveDonationGifUrl,
  resolveRewardImageUrl,
  resolveRewardRandomSoundUrl,
  resolveRouletteImageUrl,
  resolveSharedEventSoundUrl,
} from "./resolveOverlayAssetUrl";

describe("joinPublicAssetPath", () => {
  it("joins BASE_URL / with public asset paths", () => {
    expect(joinPublicAssetPath("/", "assets/images/coinflip/head.png")).toBe(
      "/assets/images/coinflip/head.png",
    );
  });

  it("joins prefixed BASE_URL with public asset paths", () => {
    expect(joinPublicAssetPath("/overlay/", "assets/images/coinflip/head.png")).toBe(
      "/overlay/assets/images/coinflip/head.png",
    );
  });

  it("supports paths with a leading slash", () => {
    expect(joinPublicAssetPath("/overlay/", "/assets/images/coinflip/head.png")).toBe(
      "/overlay/assets/images/coinflip/head.png",
    );
  });

  it("avoids double slashes between BASE_URL and path", () => {
    expect(joinPublicAssetPath("/overlay//", "//assets/images/coinflip/head.png")).toBe(
      "/overlay/assets/images/coinflip/head.png",
    );
  });
});

describe("overlay asset URL resolvers", () => {
  it("resolves canonical reward image filenames", () => {
    expect(resolveRewardImageUrl("credits-1k.png")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/rewards/credits-1k.png"),
    );
  });

  it("maps old backend reward filenames to canonical local filenames", () => {
    expect(resolveRewardImageUrl("credits_1k.png")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/rewards/credits-1k.png"),
    );
    expect(resolveRewardImageUrl("randomGame.png")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/rewards/random-game.png"),
    );
    expect(resolveRewardImageUrl("multilottery_30k.png")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/rewards/multi-lottery-30k.png"),
    );
  });

  it("keeps roulette resolver compatible with backend filenames", () => {
    expect(resolveRouletteImageUrl("credits_1k.png")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/rewards/credits-1k.png"),
    );
  });

  it("resolves coinflip head and tail images", () => {
    expect(resolveCoinflipImageUrl("head")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/coinflip/head.png"),
    );
    expect(resolveCoinflipImageUrl("tail")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/coinflip/tail.png"),
    );
  });

  it("resolves reward random sound paths", () => {
    expect(resolveRewardRandomSoundUrl(1)).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/sounds/rewards/random/random-01.mp3"),
    );
    expect(resolveRewardRandomSoundUrl(11)).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/sounds/rewards/random/random-11.mp3"),
    );
  });

  it("resolves coinflip prepare sound paths", () => {
    expect(resolveCoinflipPrepareSoundUrl(1)).toBe(
      joinPublicAssetPath(
        import.meta.env.BASE_URL,
        "assets/sounds/rewards/coinflip/coinflip-prepare-01.mp3",
      ),
    );
    expect(resolveCoinflipPrepareSoundUrl(4)).toBe(
      joinPublicAssetPath(
        import.meta.env.BASE_URL,
        "assets/sounds/rewards/coinflip/coinflip-prepare-04.mp3",
      ),
    );
  });

  it("resolves shared event sound paths", () => {
    expect(resolveSharedEventSoundUrl("spinning")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/sounds/shared/spinning.mp3"),
    );
    expect(resolveSharedEventSoundUrl("win")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/sounds/shared/win.mp3"),
    );
  });

  it("resolves donation audio paths", () => {
    expect(resolveDonationAudioUrl(1)).toBe(
      joinPublicAssetPath(
        import.meta.env.BASE_URL,
        "assets/donations/audio/donation-template-01.mpga",
      ),
    );
    expect(resolveDonationAudioUrl(7)).toBe(
      joinPublicAssetPath(
        import.meta.env.BASE_URL,
        "assets/donations/audio/donation-template-07.mp3",
      ),
    );
  });

  it("resolves donation gif paths", () => {
    expect(resolveDonationGifUrl(1)).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/donations/gif/donation-template-01.gif"),
    );
  });
});
