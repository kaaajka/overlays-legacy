import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate4Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-paper" data-signature="deadpan-paper-unroll">
      <SourceMedia tier={4} className="paper-portrait" />
      <div className="paper-answer">
        <p className="paper-caption">
          WOWOW!!
          <br />
          TAK O!
        </p>
        <div className="paper-strip" />
        <DonorType {...props} amountSize={195} nameSize={68} />
      </div>
      <svg className="paper-perforation" viewBox="0 0 950 20" aria-hidden="true">
        <path d="M0 10H950" />
      </svg>
    </div>
  );
}
