import type React from "react";
import type { DonateEventModel } from "../../models/DonateEvent";

const Donate4: React.FC<IDonate4Props> = function ({ donate, images, withCommission }) {
  return (
    <div className={"donateHolder"}>
      <div className={"donate fourth animate__animated animate__fadeInDownBig"}>
        {!!images.length && <img src={images[0]} alt={""} className={"image"} />}

        <div className={"user animate__animated animate__pulse"}>
          WOWOW!!
          <span className={"nickname"}> {donate.nickname} </span>
          daje
          <span className={"amount"}>
            {" "}
            {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
              (withCommission ? donate.amount - donate.commission : donate.amount) / 100,
            )}
          </span>
          !! TAK O!
        </div>

        <div className={"text"}>{donate.message}</div>
      </div>
    </div>
  );
};

interface IDonate4Props {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
}

export default Donate4;
