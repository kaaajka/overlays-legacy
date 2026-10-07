import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate5Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-ovation" data-signature="open-arms-panorama">
      <div className="ovation-wing wing-holy">HOLY</div>
      <div className="ovation-wing wing-moly">MOLY</div>
      <div className="ovation-panorama">
        <SourceMedia tier={5} />
        <div className="ovation-lip" />
      </div>
      <DonorType {...props} amountSize={174} nameSize={64} />
      <div className="ovation-call">ALE, ŻE AŻ TYLE?!</div>
    </div>
  );
}
