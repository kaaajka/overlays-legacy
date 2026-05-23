import React from "react";
import { DonateEventModel } from "../../models/DonateEvent";

const Donate9: React.FC<IDonate9Props> = function ({ donate, images, withCommission }) {
    return (
        <div className={"donateHolder"}>
            <div className={"moneyRain"}>
                {[...new Array(150)].map((_, i) => (
                    <i className={"rain"} key={`rain_${i}`} />
                ))}
            </div>

            <div className={"haloFloats"}>
                {[...new Array(30)].map((_, i) => (
                    <strong className={"halo"} key={`haloFloat_${i}`}>HALO</strong>
                ))}
            </div>
                
            <div className={"donate seventh"}>
                <div className={"coZaPojeb animate__animated animate__flash"}>
                    <span className={"co animate__animated animate__fadeInDownBig"}>!!! CO</span>
                    <span className={"za animate__animated animate__fadeInDownBig"}> ZA </span>
                    <span className={"pojeb animate__animated animate__fadeInDownBig"}>POJEB !!!</span>
                </div>
                {!!images.length && <img src={images[0]} alt={""} className={"image animate__animated animate__fadeInRightBig"} />}

                <div className={"user animate__animated animate__fadeInUpBig"}>
                    <span className={"donateInfo animate__animated animate__pulse"}>
                        <span className={"nickname"}> {donate.nickname} </span><br />
                        pierdolnął/ęła<br />
                        <span className={"wtf"}>!! WTF !!</span>
                        <span className={"amount"}>
                            {" "}
                            {new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
                            (withCommission ? donate.amount - donate.commission : donate.amount) / 100
                            )}
                            {" "}
                        </span>
                        <span className={"wtf"}>!! WTF !!</span>
                    </span>
                </div>

                <div className={"text animate__animated animate__fadeInUpBig"}>{donate.message}</div>
            </div>
        </div>
    );
};

interface IDonate9Props {
    donate: DonateEventModel;
    images: string[];
    withCommission: boolean;
}
export default Donate9;
