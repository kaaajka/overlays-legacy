import type React from "react";
import type { DonateEventModel } from "../../models/DonateEvent";

const Donate2: React.FC<IDonate2Props> = function ({ donate, images, withCommission }) {
  const isTraffic = donate.nickname.toLowerCase() === "zawistnymoddamian";

  return (
    <div className={"donateHolder"}>
      <div className={"donate second animate__animated animate__fadeInDownBig"}>
        {!!images.length && <img src={images[0]} alt={""} className={"image"} />}

        <div className={"user animate__animated animate__pulse" + (isTraffic ? " traffic" : "")}>
          {isTraffic && (
            <>
              Dzięki<span className={"nickname"}> {donate.nickname} </span> za
              <span className={"amount"}>
                {" "}
                {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                  (withCommission ? donate.amount - donate.commission : donate.amount) / 100,
                )}{" "}
              </span>
              i wyrównanie licznika potężny techniku
            </>
          )}
          {!isTraffic && (
            <>
              <span className={"nickname"}>{donate.nickname} </span>
              wplaca
              <span className={"amount"}>
                {" "}
                {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                  (withCommission ? donate.amount - donate.commission : donate.amount) / 100,
                )}{" "}
              </span>
              dzieki za wsparcie &lt;3
            </>
          )}
        </div>

        <div className={"text"}>{donate.message}</div>
      </div>
    </div>
  );
};

interface IDonate2Props {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
}

export default Donate2;
