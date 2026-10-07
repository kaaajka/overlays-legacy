import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate6Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-heart" data-signature="hand-heart-handoff">
      <div className="heart-booth">
        <SourceMedia tier={6} />
        <div className="heart-call">HALO, HALO!</div>
      </div>
      <svg className="heart-bridge" viewBox="0 0 1100 760" aria-hidden="true">
        <path
          className="heart-line"
          pathLength="1"
          d="M1080 230H860C830 100 630 110 620 290C610 110 410 100 380 230C330 380 620 530 620 530S910 380 860 230M620 530L20 530"
        />
      </svg>
      <DonorType {...props} amountSize={184} />
      <p className="heart-thanks">TO SERCE JEST DLA CIEBIE.</p>
    </div>
  );
}
