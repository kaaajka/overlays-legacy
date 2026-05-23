import React from "react";
import { DonateEventModel } from "../../models/DonateEvent";

const Donate5: React.FC<IDonate5Props> = function ({ donate, images, withCommission }) {
  const [holy, setHoly] = React.useState([]);

  React.useEffect(() => {
    const holyStates = [
      ["HOLY", "", "HOLY", "HO", "HO", "HOLY"],
      ["HOLY", "", "MOLY", "", "", ""],
      ["", "HOLY", "", "HOLY", "HOLY", "MOLY"],
    ];

    setHoly(holyStates[0]);

    const timeout1 = setTimeout(() => {
      setHoly(holyStates[1]);
    }, 5000);

    const timeout2 = setTimeout(() => {
      setHoly(holyStates[2]);
    }, 12000);

    return () => {
      if (timeout1) clearTimeout(timeout1);
      if (timeout2) clearTimeout(timeout2);
    };
  }, []);

  return (
    <div className={"donateHolder"}>
      <div className={"holymoly"}>
        {[...new Array(6)].map((_, i) => (
          <strong className={"holy"} key={`holy_${i}`}>
            {holy[i]}
          </strong>
        ))}
      </div>
      <div className={"donate fifth"}>
        {!!images.length && <img src={images[0]} alt={""} className={"image"} />}

        <div className={"user animate__animated animate__pulse"}>
          <div>
            Ale, że
            <span className={"nickname"}> {donate.nickname} </span>
            wpłacił
          </div>
          <div>
            <span className={"amount"}>
              {" "}
              {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                (withCommission ? donate.amount - donate.commission : donate.amount) / 100,
              )}
              {"?? "}
            </span>
            OMG!
          </div>
        </div>

        <div className={"text"}>{donate.message}</div>
      </div>
    </div>
  );
};

interface IDonate5Props {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
}

export default Donate5;
