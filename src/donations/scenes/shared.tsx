import type { DonateEventModel } from "../../models/DonateEvent";

export type SceneContentProps = { donate: DonateEventModel; amount: string };
export function DonorType({
  donate,
  amount,
  amountSize,
  nameSize = 70,
}: SceneContentProps & { amountSize: number; nameSize?: number }) {
  const width = 790;
  return (
    <div className="scene-copy">
      <div
        className="motion-name"
        style={{
          fontSize: Math.max(
            32,
            Math.min(nameSize, width / Math.max(1, donate.nickname.length * 0.65)),
          ),
        }}
      >
        {donate.nickname || "Anonim"}
      </div>
      <div
        className="motion-amount"
        style={{
          fontSize: Math.min(amountSize, width / (amount.length * 0.62 + 0.55)),
        }}
      >
        <span className="motion-amount-number">{amount}</span>
        <span className="motion-currency">zł</span>
      </div>
    </div>
  );
}
