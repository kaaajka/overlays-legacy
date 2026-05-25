import { describe, expect, it } from "vitest";

import Donate1 from "../components/donations/Donate1";
import Donate2 from "../components/donations/Donate2";
import Donate3 from "../components/donations/Donate3";
import Donate4 from "../components/donations/Donate4";
import Donate5 from "../components/donations/Donate5";
import Donate6 from "../components/donations/Donate6";
import Donate7 from "../components/donations/Donate7";
import Donate8 from "../components/donations/Donate8";
import Donate10 from "../components/donations/Donate10";
import { joinPublicAssetPath } from "../assets/resolveOverlayAssetUrl";
import { resolveDonationTemplate } from "./resolveDonationTemplate";

describe("resolveDonationTemplate", () => {
  it.each([
    [0, Donate1],
    [49, Donate1],
    [50, Donate1],
    [499, Donate1],
    [500, Donate2],
    [501, Donate2],
    [2499, Donate2],
    [2500, Donate3],
    [5000, Donate4],
    [10000, Donate5],
    [15000, Donate6],
    [29999, Donate6],
    [30000, Donate7],
    [39999, Donate7],
    [40000, Donate8],
    [49999, Donate8],
    [50000, Donate10],
    [999999, Donate10],
  ])(
    "locks legacy donation template selection for amount %i",
    (amount, expectedTemplate) => {
      expect(resolveDonationTemplate(amount).template).toBe(expectedTemplate);
    },
  );

  it("keeps exact threshold values assigned to the higher template as locked legacy behavior", () => {
    expect(resolveDonationTemplate(500).template).toBe(Donate2);
    expect(resolveDonationTemplate(2500).template).toBe(Donate3);
    expect(resolveDonationTemplate(5000).template).toBe(Donate4);
    expect(resolveDonationTemplate(10000).template).toBe(Donate5);
    expect(resolveDonationTemplate(15000).template).toBe(Donate6);
    expect(resolveDonationTemplate(30000).template).toBe(Donate7);
    expect(resolveDonationTemplate(40000).template).toBe(Donate8);
    expect(resolveDonationTemplate(50000).template).toBe(Donate10);
  });

  it("preserves sound, gif, speech, and commission config", () => {
    const template = resolveDonationTemplate(500);

    expect(template.minAmount).toBe(500);
    expect(template.amountWithoutCommission).toBe(true);
    expect(template.images).toEqual([
      joinPublicAssetPath(
        import.meta.env.BASE_URL,
        "assets/donations/gif/donation-template-02.gif",
      ),
    ]);
    expect(template.sound).toEqual({
      url: joinPublicAssetPath(
        import.meta.env.BASE_URL,
        "assets/donations/audio/donation-template-02.mpga",
      ),
      volume: 0.14,
    });
    expect(template.speech).toEqual({
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_MALE",
      volume: 0.4,
    });
  });
});
