import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate2Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-mask" data-signature="silhouette-echo">
      <div className="mask-floor" />
      <SourceMedia tier={2} className="mask-echo echo-left" delay={0.12} />
      <SourceMedia tier={2} className="mask-echo echo-right" delay={0.24} />
      <SourceMedia tier={2} className="mask-lead" />
      <DonorType {...props} amountSize={176} nameSize={76} />
      <div className="mask-call">DZIĘKI ZA WSPARCIE &lt;3</div>
    </div>
  );
}
