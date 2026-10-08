import type { DonateEventModel } from "../../models/DonateEvent";

export type SceneContentProps = { donate: DonateEventModel; amount: string };
export function DonorType({
  donate,
  amount,
  amountSize,
  nameSize = 70,
  width = 480,
}: SceneContentProps & { amountSize: number; nameSize?: number; width?: number }) {
  return (
    <div className="scene-copy">
      <div
        className="motion-name"
        style={{
          fontSize: Math.max(
            28,
            Math.min(44, nameSize, width / Math.max(1, donate.nickname.length * 0.7)),
          ),
        }}
      >
        {donate.nickname || "Anonim"}
      </div>
      <div
        className="motion-amount"
        style={{
          fontSize: Math.min(112, amountSize, (width - 28) / (amount.length * 0.72 + 0.4)),
        }}
      >
        <span className="motion-amount-number">{amount}</span>
        <span className="motion-currency">zł</span>
      </div>
    </div>
  );
}
