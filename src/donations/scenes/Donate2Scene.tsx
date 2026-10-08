import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate2Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-mask" data-signature="silhouette-echo">
      <svg className="mask-floor" viewBox="0 0 630 76" aria-hidden="true">
        <path d="M6 70H225C227 58 235 6 249 8C267 10 265 55 268 62C275 40 304 5 317 13C335 29 298 58 296 70H624" />
      </svg>
      <SourceMedia tier={2} className="mask-echo echo-left" delay={0.12} />
      <SourceMedia tier={2} className="mask-echo echo-right" delay={0.24} />
      <SourceMedia tier={2} className="mask-lead" />
      <DonorType {...props} width={580} amountSize={176} nameSize={76} />
      <div className="mask-call">DZIĘKI ZA WSPARCIE &lt;3</div>
    </div>
  );
}
