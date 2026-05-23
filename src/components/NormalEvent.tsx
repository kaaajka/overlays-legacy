import type React from "react";
import { observer } from "mobx-react";

import { EventState } from "../models/Event";
import type { NormalEventModel } from "../models/NormalEvent";

const objectHasOwn = (Object as unknown as {
  hasOwn: (object: object, property: PropertyKey) => boolean;
}).hasOwn;

const NormalEvent: React.FC<INormalEventProps> = ({ images, event }) => (
  <div className={`event${event.state === EventState.PREPARE ? " center" : " right"}`}>
    {objectHasOwn(images, event.key) && (
      <div className="image">
        <img src={images[event.key]} alt="" />
      </div>
    )}
    <div className="desc">{event.description}</div>
    {typeof event.time !== "undefined" && <div className="timer">{event.formattedTime}</div>}
  </div>
);

interface INormalEventProps {
  images: Record<string, string>;
  event: NormalEventModel;
}

export default observer(NormalEvent);
