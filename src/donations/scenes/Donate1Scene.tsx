import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate1Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-turkey" data-signature="turkey-two-step">
      <div className="turkey-room">
        <SourceMedia tier={1} />
        <div className="turkey-floor" />
      </div>
      <img
        className="turkey-community-reply"
        src={`${import.meta.env.BASE_URL}assets/donations/brand/bunny-cyan.png`}
        alt=""
        aria-hidden="true"
      />
      <div className="turkey-reply">
        <p className="scene-phrase">DZIĘKI ZA TEN TANIEC.</p>
        <DonorType {...props} width={440} amountSize={176} />
      </div>
      <svg className="turkey-step" viewBox="0 0 800 60" aria-hidden="true">
        <path d="M20 30H220L260 10L300 50L340 30H780" />
      </svg>
    </div>
  );
}
