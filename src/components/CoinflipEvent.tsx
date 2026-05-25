import { createRef, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { observer } from "mobx-react";

import type { CoinflipEventModel } from "../models/CoinflipEvent";
import { EventState } from "../models/Event";
import { resolveSharedEventSoundUrl } from "../assets/resolveOverlayAssetUrl";
import { playOverlayAudio } from "../audio/playOverlayAudio";

const timeoutTimes: { spin: number; hideSegmentImage: number } = {
  spin: 2 * 1000,
  hideSegmentImage: (2 + 7 + 0.5 + 4 + 1.5) * 1000,
};

const segmentItems = [...new Array(100)].map((_, index) => ({
  index,
  key: `segment_${index}`,
}));

const CoinflipEvent = ({ event, images }: ICoinflipEventProps) => {
  const [hideSegmentImage, setHideSegmentImage] = useState(false);
  const spinningSoundUrl = useRef(resolveSharedEventSoundUrl("spinning"));
  const segmentRefs = useRef<RefObject<HTMLDivElement>[]>(
    [...new Array(100)].map(() => createRef<HTMLDivElement>()),
  );
  const spinTimeout = useRef<ReturnType<typeof setTimeout>>();
  const hideSegmentImageTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (spinTimeout.current) clearTimeout(spinTimeout.current);
    if (hideSegmentImageTimeout.current)
      clearTimeout(hideSegmentImageTimeout.current);

    if (typeof event.winner !== "number") return;

    setHideSegmentImage(false);

    spinTimeout.current = setTimeout(() => {
      playOverlayAudio({
        url: spinningSoundUrl.current,
        volume: 0.5,
        label: "Coinflip spinning sound",
        mutedFixtureAudioKind: "template",
      });
    }, timeoutTimes.spin);

    hideSegmentImageTimeout.current = setTimeout(() => {
      setHideSegmentImage(true);
    }, timeoutTimes.hideSegmentImage);

    return () => {
      if (spinTimeout.current) clearTimeout(spinTimeout.current);
      if (hideSegmentImageTimeout.current)
        clearTimeout(hideSegmentImageTimeout.current);
    };
  }, [event.winner]);

  useEffect(
    () => () => {
      if (spinTimeout.current) clearTimeout(spinTimeout.current);
      if (hideSegmentImageTimeout.current)
        clearTimeout(hideSegmentImageTimeout.current);
    },
    [],
  );

  if (event.state === EventState.PREPARE) {
    return (
      <div className={"event center"}>
        {Object.hasOwn(images, event.key) && (
          <div className={"image"}>
            <img src={images[event.key]} alt={""} />
          </div>
        )}
        <div className={"desc"}>{event.description}</div>
      </div>
    );
  }

  const coinLandingSide = event.coin_landing_side === 1 ? "head" : "tail";

  const rouletteClassNames = ["roulette", `chosen-segment-${event.winner}`];
  const notChosenSegmentClassNames = ["segment", "not-chosen"];
  const coinClassNames = ["coin", `land-${coinLandingSide}`];
  const coinFrontClassNames = ["front"];

  if (hideSegmentImage) coinFrontClassNames.push("show-head-image");
  if (event.coin_chosen_side) {
    const coinChosenSide = event.coin_chosen_side === 1 ? "head" : "tail";
    rouletteClassNames.push("chosen-side");
    coinClassNames.push(`chosen-${coinChosenSide}`);
  }

  return (
    <div className={"event coinflip"}>
      <div className={rouletteClassNames.join(" ")}>
        {segmentItems.map(({ index, key }) => {
          if (event.winner === index) {
            return (
              <div
                key={key}
                className={"segment chosen"}
                ref={segmentRefs.current[index]}
              >
                <div className={"inner"}>
                  <div className={coinClassNames.join(" ")}>
                    <div className={coinFrontClassNames.join(" ")}>
                      {!hideSegmentImage && (
                        <p>{event.segments[index]?.name ?? ""}</p>
                      )}
                    </div>
                    <div className={"thick"}></div>
                    <div className={"back"}></div>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div
              key={key}
              className={notChosenSegmentClassNames.join(" ")}
              ref={segmentRefs.current[index]}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

interface ICoinflipEventProps {
  images: Record<string, string>;
  event: CoinflipEventModel;
}

export default observer(CoinflipEvent);
