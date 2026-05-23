import type React from "react";
import type { DonateEventModel } from "../../models/DonateEvent";

const Donate10: React.FC<IDonate10Props> = ({ donate, images, withCommission }) => {
  return (
    <div className={"donateHolder"}>
      <div className={"moneyRain"}>
        {[...new Array(150)].map((_, i) => (
          <i className={"rain"} key={`rain_${i}`} />
        ))}
      </div>

      <div className={"haloFloats"}>
        {[...new Array(30)].map((_, i) => (
          <strong className={"halo"} key={`haloFloat_${i}`}>
            HALO
          </strong>
        ))}
      </div>

      <div className={"donate tenth"}>
        <div className={"coZaPojeb animate__animated animate__tada"}>
          <span className={"co animate__animated animate__fadeInDownBig"}>CZY TO</span>
          <span className={"za animate__animated animate__fadeInDownBig"}> JEST </span>
          <span className={"pojeb animate__animated animate__fadeInDownBig"}>SEN?!</span>
        </div>
        {!!images.length && (
          <img
            src={images[0]}
            alt={""}
            className={"image animate__animated animate__fadeInRightBig"}
          />
        )}

        <div className={"user animate__animated animate__fadeInUpBig"}>
          <span className={"donateInfo animate__animated animate__pulse"}>
            <span className={"nickname"}> {donate.nickname} </span>
            <br />
            <span className={"wtf"}>odpalił/odpaliła bombę</span>
            <br />
            <span className={"wtf"}>!!! MASAKRA !!!</span>
            <span className={"amount"}>
              {" "}
              {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                (withCommission ? donate.amount - donate.commission : donate.amount) / 100,
              )}{" "}
            </span>
            <span className={"wtf"}>!!! MASAKRA !!!</span>
          </span>
        </div>

        <div className={"text animate__animated animate__fadeInUpBig"}>{donate.message}</div>
      </div>
    </div>
  );
};

interface IDonate10Props {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
}
export default Donate10;
