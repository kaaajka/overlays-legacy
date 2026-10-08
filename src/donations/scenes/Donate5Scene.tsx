import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate5Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-ovation" data-signature="open-arms-panorama">
      <div className="ovation-wing wing-holy" role="img" aria-label="HOLY" />
      <div className="ovation-wing wing-moly" role="img" aria-label="MOLY" />
      <img
        className="ovation-community-reply"
        src={`${import.meta.env.BASE_URL}assets/donations/brand/bunny-cyan.png`}
        alt=""
        aria-hidden="true"
      />
      <div className="ovation-panorama">
        <SourceMedia tier={5} />
        <div className="ovation-lip" />
      </div>
      <DonorType {...props} width={420} amountSize={174} nameSize={64} />
      <div className="ovation-call">ALE, ŻE AŻ TYLE?!</div>
    </div>
  );
}
