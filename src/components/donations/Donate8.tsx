import React from "react";
import { DonateEventModel } from "../../models/DonateEvent";

const Donate8: React.FC<IDonate8Props> = function ({ donate, images, withCommission }) {
  const [stage, setStage] = React.useState(1);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setStage(2);
    }, 2750);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <div className={"donateHolder"}>
      <div className={"fireworks"}>
        {[...new Array(20)].map((_, i) => (
          <div className={"firework"} key={`firework_${i}`}></div>
        ))}
      </div>

      <div className={"sayMyName"}>
        {stage === 1 && <div className={"say say1"}>SAY</div>}
        {stage === 1 && <div className={"my my1"}>MY</div>}
        {stage === 1 && <div className={"name name1"}>NAME</div>}
        <div className={"animate__animated animate__flash animate__infinite"}>
          {stage >= 2 && <div className={"say say2 animate__animated animate__fadeIn"}>SAY</div>}
          {stage >= 2 && <div className={"my my2 animate__animated animate__fadeIn"}>MY</div>}
          {stage >= 2 && <div className={"name name2 animate__animated animate__fadeIn"}>NAME</div>}
        </div>
      </div>
      <div className={"donate eighth"}>
        {!!images.length && (
          <img
            src={images[0]}
            alt={""}
            className={"image animate__animated animate__fadeInRightBig"}
          />
        )}

        <div className={"user"}>
          <div className={"donateInfo animate__animated animate__pulse"}>
            <div className={"nickname"}> {donate.nickname} </div>
            <div className={"donateInfoRest animate__animated animate__fadeInUpBig"}>
              pierdolnął/ęła
              <br />
              <span className={"wtf"}>!! WTF !!</span>
              <span className={"amount"}>
                {" "}
                {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                  (withCommission ? donate.amount - donate.commission : donate.amount) / 100,
                )}{" "}
              </span>
              <span className={"wtf"}>!! WTF !!</span>
            </div>
          </div>
        </div>

        <div className={"text animate__animated animate__fadeInUpBig"}>{donate.message}</div>
      </div>
    </div>
  );
};

interface IDonate8Props {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
}
export default Donate8;
