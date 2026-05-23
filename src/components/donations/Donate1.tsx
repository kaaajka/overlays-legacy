import type React from "react";

import type { DonateEventModel } from "../../models/DonateEvent";

const Donate1: React.FC<IDonate1Props> = ({ donate, images, withCommission }) => {
  const isTraffic = donate.nickname.toLowerCase() === "zawistnymoddamian";

  return (
    <div className={"donateHolder"}>
      <div className={"donate first animate__animated animate__fadeInDownBig"}>
        {!!images.length && <img src={images[0]} alt={""} className={"image"} />}

        <div className={`user animate__animated animate__pulse${isTraffic ? " traffic" : ""}`}>
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
              wrzuca
              <span className={"amount"}>
                {" "}
                {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                  (withCommission ? donate.amount - donate.commission : donate.amount) / 100,
                )}
              </span>
            </>
          )}
        </div>

        <div className={"text"}>{donate.message}</div>
      </div>
    </div>
  );
};

interface IDonate1Props {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
}
export default Donate1;
