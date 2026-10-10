import { SourceMedia } from "../../motion/media/SourceMedia";
import { DonorType } from "./shared";
import type { SceneContentProps } from "./shared";
import "./donate6-hybrid.css";

/** Approved hybrid geometry is sampled by the director, never by a component clock. */
export function Donate6Scene(props: SceneContentProps) {
  return (
    <div
      className="scene-content scene-heart d6-hybrid"
      data-signature="halo-hybrid"
      data-nickname={props.donate.nickname || "Anonim"}
      data-amount={props.amount}
      data-message={props.donate.message}
    >
      <div className="d6-renderer" aria-hidden="true" />
      <section
        className="d6-readable"
        aria-label={`HALO HALO! ${props.donate.nickname}, ${props.amount} zł. CO JEST?!`}
      >
        <p className="d6-upper">HALO!</p>
        <SourceMedia tier={6} />
        <p className="d6-lower">HALO!</p>
        <p className="d6-reply">CO JEST?!</p>
        <DonorType {...props} amountSize={112} nameSize={44} width={760} />
      </section>
    </div>
  );
}
