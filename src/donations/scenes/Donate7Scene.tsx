/* THESIS: the tiny webcam recruits a wall, interrupts the broadcast, then breaks it again.
OWN-WORLD: plum CRTs, cream slams, peach/pink paper and cyan signals, original bunny reactions.
STORY: signal → cascade → takeover → exchange → false calm → final event → CRT shutdown.
FIRST VIEWPORT: one small CRT; fixed donor stack outside camera; viewport-wide spectacle.
FORM: owner-pinned Donate7 broadcast wall, original 120px footage, absolute music clock.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */
import { SourceMedia, mediaUrls } from "../../motion/media/SourceMedia";
import { resolvePublicAssetUrl } from "../../assets/resolveOverlayAssetUrl";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
import "./donate7-show.css";

export function Donate7Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-webcam d7-show" data-signature="broadcast-reaction-wall">
      <div className="d7-blackout" aria-hidden="true" />
      <div className="d7-light" aria-hidden="true" />
      <div className="d7-camera">
        <div className="d7-monitor-wall">
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <div key={slot} className={`d7-monitor d7-still d7-slot-${slot}`}>
              <div className="d7-screen">
                <img
                  src={resolvePublicAssetUrl(`assets/donations/media/donate7-pose-${slot % 4}.png`)}
                  alt=""
                />
              </div>
              <span className="d7-halo">HALO</span>
              <i className="d7-led" />
            </div>
          ))}
          <div className="d7-monitor d7-main-monitor">
            <SourceMedia tier={7} className="d7-source" />
            <span className="d7-halo">HALO?</span>
            <i className="d7-led" />
          </div>
          <div className="d7-monitor d7-satellite d7-satellite-a">
            <SourceMedia tier={7} className="d7-source" delay={0.12} />
            <i className="d7-led" />
          </div>
          <div className="d7-monitor d7-satellite d7-satellite-b">
            <SourceMedia tier={7} className="d7-source" delay={0.24} />
            <i className="d7-led" />
          </div>
        </div>
        <div className="d7-headline" role="img" aria-label="CO ZA POJEB!!!">
          <div className="d7-setup">
            <span className="d7-co">CO</span>
            <span className="d7-za">ZA</span>
          </div>
          <div className="d7-slam-mask">
            <strong className="d7-slam">POJEB!!!</strong>
          </div>
          <strong className="d7-type-echo" aria-hidden="true">
            POJEB!!!
          </strong>
        </div>
        <div className="d7-wtf">!! WTF !!</div>
        <svg className="d7-impact" viewBox="0 0 700 350" fill="none" aria-hidden="true">
          <title>Reaction impact strokes</title>
          <path d="M28 104Q64 116 81 137M76 48Q101 82 113 106M640 58Q615 83 592 106M678 137Q641 137 616 155M92 267Q318 304 544 264M577 291Q590 308 608 305" />
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
        <div className="d7-signal-word">
          HALO<span>?</span>
        </div>
        <div className="d7-monitor-ghost">
          <img src={mediaUrls(7).poster} alt="" />
        </div>
      </div>
      <DonorType {...props} width={540} amountSize={112} />
    </div>
  );
}
