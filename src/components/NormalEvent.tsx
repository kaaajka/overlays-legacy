import React from "react";
import { observer } from "mobx-react";

import { NormalEventModel } from "../models/NormalEvent";
import { EventState } from "../models/Event";

const NormalEvent: React.FC<INormalEventProps> = function ({ images, event }) {
    return (
        <div className={"event" + (event.state === EventState.PREPARE ? " center" : " right")}>
            {images.hasOwnProperty(event.key) && (
                <div className={"image"}>
                    <img src={images[event.key]} alt={""} />
                </div>
            )}
            <div className={"desc"}>{event.description}</div>
            {typeof event.time !== "undefined" && <div className={"timer"}>{event.formattedTime}</div>}
        </div>
    );
};

interface INormalEventProps {
    images: { [key: string]: any };
    event: NormalEventModel;
}

export default observer(NormalEvent);
