import { useCallback, useEffect, useRef } from "react";
import { resolveGoalImageUrl } from "../assets/resolveOverlayAssetUrl";

const CIRCLE_MAX_SIZE = 790;
const LINE_WIDTH = 35;
const INNER_LINE_COLOR = "#dddddd";

function applyAngle(
  point: { x: number; y: number },
  angle: number,
  distance: number,
) {
  return {
    x: point.x + Math.cos(angle) * distance,
    y: point.y + Math.sin(angle) * distance,
  };
}

export default function Goal({ current, goal, type }: IGoalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D>();
  const canvasSizeRef = useRef(CIRCLE_MAX_SIZE);
  const centerPositionRef = useRef<{ x: number; y: number }>();
  const backgroundLoadedRef = useRef(false);
  const backgroundImageRef = useRef<HTMLImageElement>();
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const savedPixelsRef = useRef<Uint8ClampedArray>();
  const isMountedRef = useRef(false);
  const goalPercentageRef = useRef(current / goal);

  if (!backgroundImageRef.current) {
    backgroundImageRef.current = new Image();
  }

  const drawProgress = useCallback(() => {
    const canvasContext = canvasContextRef.current;
    const centerPosition = centerPositionRef.current;

    if (!canvasContext || !centerPosition) return;

    const canvasSize = canvasSizeRef.current;
    const th1 = -90 * (Math.PI / 180);
    const th2 = (goalPercentageRef.current * 360 - 90) * (Math.PI / 180);
    const d1 = applyAngle(centerPosition, th1, canvasSize / 2);
    const d2 = applyAngle(centerPosition, th2, canvasSize / 2 - LINE_WIDTH);
    const magicGradient = canvasContext.createLinearGradient(
      d1.x,
      d1.y,
      d2.x,
      d2.y,
    );

    magicGradient.addColorStop(0, "#ffc5e6");
    magicGradient.addColorStop(0.25, "#FCBCD7");
    magicGradient.addColorStop(0.5, "#F9A3CB");
    magicGradient.addColorStop(0.75, "#EF87BE");
    magicGradient.addColorStop(1, "#E56AB3");

    canvasContext.beginPath();
    canvasContext.arc(
      centerPosition.x,
      centerPosition.y,
      canvasSize / 2,
      th1,
      th2,
      false,
    );
    canvasContext.arc(
      centerPosition.x,
      centerPosition.y,
      canvasSize / 2 - LINE_WIDTH,
      th2,
      th1,
      true,
    );
    canvasContext.fillStyle = magicGradient;
    canvasContext.fill();
    canvasContext.closePath();
  }, []);

  const draw = useCallback(() => {
    const canvasContext = canvasContextRef.current;
    const centerPosition = centerPositionRef.current;
    const backgroundImage = backgroundImageRef.current;

    if (
      !isMountedRef.current ||
      !canvasContext ||
      !centerPosition ||
      !backgroundLoadedRef.current ||
      !backgroundImage
    )
      return;

    const canvasSize = canvasSizeRef.current;

    canvasContext.clearRect(0, 0, canvasSize, canvasSize);

    canvasContext.save();

    canvasContext.beginPath();
    canvasContext.arc(
      centerPosition.x,
      centerPosition.y,
      canvasSize / 2 - LINE_WIDTH,
      0,
      2 * Math.PI,
      false,
    );
    canvasContext.closePath();
    canvasContext.clip();

    canvasContext.save();
    //canvasContext.globalAlpha = goalPercentageRef.current > 0.4 ? goalPercentageRef.current : 0.4;
    canvasContext.drawImage(backgroundImage, 0, 0, canvasSize, canvasSize);
    canvasContext.restore();

    canvasContext.beginPath();
    canvasContext.arc(
      centerPosition.x,
      centerPosition.y,
      canvasSize / 2,
      2 * Math.PI,
      0,
      true,
    );
    canvasContext.clip();
    canvasContext.closePath();

    const imageData = canvasContext.getImageData(0, 0, canvasSize, canvasSize);

    if (!savedPixelsRef.current)
      savedPixelsRef.current = new Uint8ClampedArray(imageData.data);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const average =
        (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) /
        3;

      imageData.data[i] = average;
      imageData.data[i + 1] = average;
      imageData.data[i + 2] = average;
      imageData.data[i + 3] = imageData.data[i + 3]
        ? 100
        : imageData.data[i + 3];
    }

    const start =
      imageData.width *
      4 *
      Math.round(imageData.height * (1 - goalPercentageRef.current));

    for (let i = start; i < imageData.data.length; i += 4) {
      imageData.data[i] = savedPixelsRef.current[i];
      imageData.data[i + 1] = savedPixelsRef.current[i + 1];
      imageData.data[i + 2] = savedPixelsRef.current[i + 2];
      imageData.data[i + 3] = savedPixelsRef.current[i + 3];
    }

    canvasContext.putImageData(imageData, 0, 0);

    canvasContext.restore();

    canvasContext.beginPath();
    canvasContext.arc(
      centerPosition.x,
      centerPosition.y,
      canvasSize / 2 - LINE_WIDTH,
      0,
      2 * Math.PI,
      false,
    );
    canvasContext.arc(
      centerPosition.x,
      centerPosition.y,
      canvasSize / 2,
      2 * Math.PI,
      0,
      true,
    );
    canvasContext.fillStyle = INNER_LINE_COLOR;
    canvasContext.fill();
    canvasContext.closePath();

    drawProgress();
  }, [drawProgress]);

  const setup = useCallback(() => {
    if (!isMountedRef.current) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const toOperate = windowWidth < windowHeight ? windowWidth : windowHeight;

    if (toOperate <= CIRCLE_MAX_SIZE) {
      canvasSizeRef.current = toOperate;
    } else {
      if (canvasSizeRef.current !== CIRCLE_MAX_SIZE)
        canvasSizeRef.current = CIRCLE_MAX_SIZE;
    }

    if (!canvasRef.current) return;

    savedPixelsRef.current = undefined;
    canvasRef.current.width = canvasSizeRef.current;
    canvasRef.current.height = canvasSizeRef.current;

    centerPositionRef.current = {
      x: canvasSizeRef.current / 2,
      y: canvasSizeRef.current / 2,
    };

    if (!canvasContextRef.current) {
      canvasContextRef.current = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
    }

    const backgroundImage = backgroundImageRef.current;
    if (!backgroundImage) return;

    if (backgroundLoadedRef.current) draw();
    else {
      backgroundImage.src = resolveGoalImageUrl("kaaajk4-love");
      backgroundImage.onload = () => {
        if (!isMountedRef.current) return;

        backgroundLoadedRef.current = true;
        draw();
      };
    }
  }, [draw]);

  const onResize = useCallback(() => {
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);

    resizeTimeoutRef.current = setTimeout(() => {
      resizeTimeoutRef.current = undefined;
      setup();
    }, 100);
  }, [setup]);

  useEffect(() => {
    isMountedRef.current = true;
    setup();

    window.addEventListener("resize", onResize);

    return () => {
      isMountedRef.current = false;

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = undefined;
      }

      savedPixelsRef.current = undefined;

      if (backgroundImageRef.current) {
        backgroundImageRef.current.onload = null;
      }

      window.removeEventListener("resize", onResize);
    };
  }, [setup, onResize]);

  useEffect(() => {
    goalPercentageRef.current = current / goal;

    if (goalPercentageRef.current > 1) goalPercentageRef.current = 1;
    else draw();
  }, [current, goal, draw]);

  return (
    <div className={"goal"}>
      {type === "subs" && <h5>Cel subów</h5>}
      {type === "followers" && <h5>Cel followów</h5>}

      <canvas ref={canvasRef} />

      <div className={"text"}>
        {current} / {goal}
      </div>
    </div>
  );
}

interface IGoalProps {
  current: number;
  goal: number;
  type: "followers" | "subs";
}
