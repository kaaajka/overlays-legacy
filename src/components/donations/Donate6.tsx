import React from "react";
import { DonateEventModel } from "../../models/DonateEvent";

const Donate6: React.FC<IDonate6Props> = function ({ donate, images, withCommission }) {
    const [showTogether, setShowTogether] = React.useState(false);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setShowTogether(true);
        }, 1200);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, []);

    return (
        <div className={"donateHolder"}>
            <div className={"moneyRain"}>
                {[...new Array(150)].map((_, i) => (
                    <i className={"rain"} key={`rain_${i}`} />
                ))}
            </div>

            <div className={"donate sixth"}>
                {!showTogether && (
                    <>
                        <div className={"halo h1 animate__animated animate__fadeInDownBig"}>!!! HALO !!!</div>
                        <div className={"halo h2 animate__animated animate__fadeInDownBig"}>!!! HALO !!!</div>
                    </>
                )}
                {showTogether && <div className={"haloTogether animate__animated animate__flash"}>!!! HALO HALO !!!</div>}
                {!!images.length && <img src={images[0]} alt={""} className={"image animate__animated animate__fadeInRightBig"} />}

                <div className={"user animate__animated animate__fadeInUpBig"}>
                    <span className={"lala animate__animated animate__pulse"}>
                        <span className={"nickname"}> {donate.nickname} </span>
                    wleciał/a za
                    <span className={"amount"}>
                        {" "}
                        {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                          (withCommission ? donate.amount - donate.commission : donate.amount) / 100
                        )}
                        {" "}
                    </span>
                    Co jest !?
                    </span>
                </div>

                <div className={"text animate__animated animate__fadeInUpBig"}>{donate.message}</div>
            </div>
        </div>
    );
};

interface IDonate6Props {
    donate: DonateEventModel;
    images: string[];
    withCommission: boolean;
}
export default Donate6;
