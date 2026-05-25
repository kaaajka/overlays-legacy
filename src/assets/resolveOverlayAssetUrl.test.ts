import { describe, expect, it } from "vitest";
import { joinPublicAssetPath } from "./resolveOverlayAssetUrl";
import {
  resolveCoinflipImageUrl,
  resolveDonationAudioUrl,
  resolveDonationGifUrl,
  resolveRouletteImageUrl,
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
  it("resolves roulette image filenames", () => {
    expect(resolveRouletteImageUrl("credits_1k.png")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "assets/images/roulette/credits_1k.png"),
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

  it("resolves donation audio paths", () => {
    expect(resolveDonationAudioUrl("1.mpga")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "media/audio/1.mpga"),
    );
  });

  it("resolves donation gif paths", () => {
    expect(resolveDonationGifUrl("1.gif")).toBe(
      joinPublicAssetPath(import.meta.env.BASE_URL, "media/gif/1.gif"),
    );
  });
});
