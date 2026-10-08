import { SourceMedia, mediaUrls } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
export function Donate7Scene(props: SceneContentProps) {
  return (
    <div className="scene-content scene-webcam" data-signature="pixel-monitor-overload">
      <div className="webcam-wall">
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <div key={slot} className={`webcam-still monitor-slot-${slot}`}>
            <img src={mediaUrls(7).poster} alt="" />
            <span>HALO</span>
          </div>
        ))}
        <SourceMedia tier={7} className="webcam-main" />
        <SourceMedia tier={7} className="webcam-satellite satellite-a" delay={0.12} />
        <SourceMedia tier={7} className="webcam-satellite satellite-b" delay={0.24} />
      </div>
      <div className="webcam-shout">
        <span>CO ZA</span>
        <strong>POJEB!!!</strong>
      </div>
      <DonorType {...props} width={440} amountSize={202} />
      <div className="webcam-wtf">!! WTF !!</div>
    </div>
  );
}
