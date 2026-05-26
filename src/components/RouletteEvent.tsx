import { useCallback, useEffect, useRef, useState } from "react";

import type { RouletteEventModel } from "../models/RouletteEvent";
import { EventState } from "../models/Event";
import {
  resolveRouletteImageUrl,
  resolveSharedEventSoundUrl,
} from "../assets/resolveOverlayAssetUrl";
import { playOverlayAudio } from "../audio/playOverlayAudio";

type RollAnimation = {
  start: number;
  duration: number;
  dest: number;
};

const minBlocks = 18;
const blockWidth = 105;
const percentagePerBlock = 100 / minBlocks;
const spinningSoundUrl = resolveSharedEventSoundUrl("spinning");
const winSoundUrl = resolveSharedEventSoundUrl("win");

function moveAnim(n: number): number {
  return --n * n * n + 1;
}

function RouletteEvent({ event, images }: IRouletteEventProps) {
  const [finished, setFinishedState] = useState(false);
  const actualBlocksRef = useRef(minBlocks);
  const blocksMovedRef = useRef(0);
  const moveAnimationRef = useRef<ReturnType<typeof setTimeout>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const rollAnimationRef = useRef<RollAnimation>();
  const rollingRef = useRef(false);
  const finishedRef = useRef(false);
  const isMountedRef = useRef(false);
  const rollerRef = useRef<HTMLDivElement>(null);

  const setFinished = useCallback((state: boolean) => {
    if (finishedRef.current !== state) {
      finishedRef.current = state;
      setFinishedState(state);
    }
  }, []);

  const updatePosition = useCallback((offset: number) => {
    const l = actualBlocksRef.current * blockWidth;

    offset = -((offset + l - 790 / 2) % l);

    if (rollerRef.current) rollerRef.current.style.transform = `translateX(${offset}px)`;
  }, []);

  const startRoll = useCallback((winningTicket: number) => {
    if (rollingRef.current || !rollerRef.current || !isMountedRef.current) return;

    rollingRef.current = true;

    const elements = Array.from(
      rollerRef.current.querySelectorAll(".o[data-start][data-end]").values(),
    ).filter((element) => {
      const start = element.getAttribute("data-start");
      const end = element.getAttribute("data-end");

      if (!start || !end) return false;

      return Number(start) <= winningTicket && Number(end) >= winningTicket;
    });

    const randomElement = elements[Math.floor(Math.random() * elements.length)];

    if (!randomElement) return;

    const index = Array.prototype.slice.call(rollerRef.current.children).indexOf(randomElement);

    let destAngle = blockWidth * index;

    destAngle += actualBlocksRef.current * blockWidth * 2;
    destAngle += Math.random() * (blockWidth - 3 - 3) + 3;

    playOverlayAudio({
      url: spinningSoundUrl,
      volume: 0.5,
      label: "Roulette spinning sound",
      mutedFixtureAudioKind: "template",
    });

    rollAnimationRef.current = {
      duration: 10000,
      start: Date.now(),
      dest: destAngle,
    };
  }, []);

  const scheduleRoll = useCallback(
    (ticket: number) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        startRoll(ticket);
      }, 5000);
    },
    [startRoll],
  );

  const makeAnim = useCallback(() => {
    const rollAnimation = rollAnimationRef.current;

    if (rollAnimation) {
      const now = Date.now(),
        p = (now - rollAnimation.start) / rollAnimation.duration,
        c = moveAnim(p);

      if (now - rollAnimation.start <= rollAnimation.duration)
        updatePosition(rollAnimation.dest * c);
      else {
        if (!finishedRef.current)
          playOverlayAudio({
            url: winSoundUrl,
            volume: 0.4,
            label: "Roulette win sound",
            mutedFixtureAudioKind: "template",
          });

        setFinished(true);
      }
    } else updatePosition(blocksMovedRef.current++);
  }, [setFinished, updatePosition]);

  useEffect(() => {
    isMountedRef.current = true;
    blocksMovedRef.current = 0;
    rollingRef.current = false;
    setFinished(false);

    updatePosition(0);

    moveAnimationRef.current = setInterval(makeAnim, 1000 / 60);

    return () => {
      isMountedRef.current = false;

      if (moveAnimationRef.current) clearInterval(moveAnimationRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [makeAnim, setFinished, updatePosition]);

  useEffect(() => {
    if (typeof event.winner === "number") {
      scheduleRoll(event.winner);
    }
  }, [event.winner, scheduleRoll]);

  const calculateBlocks = () => {
    if (!event.items) return null;

    const normal = [],
      copy = [];

    let numBlocks = 0,
      index = 1;
    for (const item of event.items) {
      const blocks = Math.ceil(item.chance / percentagePerBlock);

      for (let i = 0; i < blocks; i++) {
        normal.push(
          <div
            className={"o reward"}
            data-start={item.start}
            data-end={item.end}
            style={{
              backgroundImage: `url(${resolveRouletteImageUrl(item.image)})`,
            }}
            key={`reward_${index++}`}
            title={item.name}
          />,
        );
        copy.push(
          <div
            className={"c reward"}
            data-start={item.start}
            data-end={item.end}
            style={{
              backgroundImage: `url(${resolveRouletteImageUrl(item.image)})`,
            }}
            key={`reward_${index++}`}
            title={item.name}
          />,
        );

        numBlocks++;
      }
    }

    actualBlocksRef.current = numBlocks;

    return normal.concat(copy);
  };

  if (event.state === EventState.PREPARE)
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

  const blocks = calculateBlocks();
  const winningItem =
    event.winner && finished
      ? event.items.find((item) => item.start <= event.winner && item.end >= event.winner)
      : null;

  return (
    <div className={"event roller"}>
      <div className={"inner"}>
        <div className={"pointer"} />
        <div className={"blocks"} ref={rollerRef}>
          {blocks}
        </div>
      </div>

      {!!winningItem && <div className={"text"}>{winningItem.name}</div>}
    </div>
  );
}

export default RouletteEvent;

interface IRouletteEventProps {
  images: Record<string, string>;
  event: RouletteEventModel;
}
