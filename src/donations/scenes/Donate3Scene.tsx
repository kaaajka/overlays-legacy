import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate3Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-rodent" data-signature="rodent-shutter-strip">
      <SourceMedia tier={3} className="rodent-left" delay={0.08} />
      <div className="rodent-projector">
        <SourceMedia tier={3} className="rodent-lead" />
        <div className="shutter shutter-top" />
        <div className="shutter shutter-bottom" />
      </div>
      <SourceMedia tier={3} className="rodent-right" delay={0.16} />
      <div className="rodent-omg">OMG!</div>
      <DonorType {...props} amountSize={174} />
    </div>
  );
}
