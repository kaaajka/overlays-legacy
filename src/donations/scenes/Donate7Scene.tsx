/* THESIS: a tiny familiar reaction recruits HALO callers, then the digits explain the commotion.
OWN-WORLD: ivory DynaPuff cutouts, berry contours, peach paper, original footage and bunny stickers.
STORY: caller → chorus → CO/ZA → title → WTF gag → brief hush → amount finale → paper fold.
FIRST VIEWPORT: original small source, one caller; the transparent game remains the stage.
FORM: reaction scrapbook, grounded candidate5, seed701ff517; delegated comp1 fan-stage.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */
import { SourceMedia } from "../../motion/media/SourceMedia";
import { resolvePublicAssetUrl } from "../../assets/resolveOverlayAssetUrl";
import type { SceneContentProps } from "./shared";
import banknote from "../../assets/images/effects/banknote-particle.png";
import "@fontsource-variable/dynapuff/standard.css";
import "@fontsource-variable/roboto-flex/full.css";
import "./donate7-show.css";

export function Donate7Scene({ donate, amount }: SceneContentProps) {
  return (
    <div className="scene-content scene-webcam d7-show" data-signature="reaction-scrapbook">
      <img className="d7-banknote-asset" src={banknote} alt="" hidden />
      <svg className="d7-spine" viewBox="0 0 1920 1080" fill="none" aria-hidden="true">
        <title>One continuous paper thread carries the reaction into the donor payoff</title>
        <path
          className="d7-spine-shadow"
          d="M553 260 C440 235 405 365 530 425 C650 485 710 380 860 410 C1030 445 1000 620 1210 720"
        />
        <path
          className="d7-spine-ink"
          d="M553 260 C440 235 405 365 530 425 C650 485 710 380 860 410 C1030 445 1000 620 1210 720"
        />
      </svg>
      <div className="d7-camera">
        <div className="d7-reactions">
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              className={`d7-aperture d7-feed-${slot} ${slot === 0 ? "d7-main-monitor" : ""}`}
            >
              <SourceMedia tier={7} className="d7-source" delay={slot * 0.12} />
            </div>
          ))}
        </div>
        <div className="d7-headline" role="img" aria-label="CO ZA POJEB!!!">
          <div className="d7-setup">
            <span className="d7-co">CO</span>
            <span className="d7-za">ZA</span>
          </div>
          <div className="d7-slam-mask">
            <strong className="d7-slam">POJEB!!!</strong>
          </div>
        </div>
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <strong key={slot} className={`d7-caller d7-call-${slot}`}>
            HALO<span>?</span>
          </strong>
        ))}
        <strong className="d7-wtf">WTF?!</strong>
        <svg className="d7-impact" viewBox="0 0 840 400" fill="none" aria-hidden="true">
          <title>Reaction accent strokes</title>
          <path d="M20 76Q43 100 51 132M84 12Q93 50 103 77M772 27Q750 48 738 75M826 112Q790 107 766 120M156 353Q405 385 674 351M697 370Q718 390 738 371" />
        </svg>
        <img
          className="d7-sticker d7-cheer"
          src={resolvePublicAssetUrl("assets/donations/brand/bunny-cheer.png")}
          alt=""
        />
        <img
          className="d7-sticker d7-cyan"
          src={resolvePublicAssetUrl("assets/donations/brand/bunny-cyan.png")}
          alt=""
        />
        <img
          className="d7-sticker d7-cry"
          src={resolvePublicAssetUrl("assets/donations/brand/donate7-bunny-cry.png")}
          alt=""
        />
      </div>
      <i className="d7-fold-edge" aria-hidden="true" />
      <div className="scene-copy d7-donor">
        <div
          className="motion-name"
          style={{
            fontSize: Math.max(28, Math.min(52, 640 / Math.max(1, donate.nickname.length * 0.85))),
          }}
        >
          {donate.nickname || "Anonim"}
        </div>
        <div
          className="motion-amount"
          style={{ fontSize: Math.min(144, 650 / (amount.length * 0.65 + 1)) }}
        >
          <span className="motion-amount-number">{amount}</span>
          <span className="motion-currency">zł</span>
        </div>
        <svg className="d7-underline" viewBox="0 0 650 32" fill="none" aria-hidden="true">
          <title>Amount underline</title>
          <path d="M8 23Q250 0 641 16" />
        </svg>
      </div>
    </div>
  );
}
