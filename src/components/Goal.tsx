import React from "react";
import { makeObservable, observable, reaction } from "mobx";
import { observer } from "mobx-react";

@observer
export default class Goal extends React.Component<IGoalProps, {}> {
    private static CIRCLE_MAX_SIZE = 790;
    private static LINE_WIDTH = 35;
    private static INNER_LINE_COLOR = "#dddddd";

    private readonly canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

    private canvasContext?: CanvasRenderingContext2D;

    private canvasSize: number = Goal.CIRCLE_MAX_SIZE;
    private centerPosition?: { x: number; y: number };

    private backgroundLoaded = false;
    private backgroundImage = new Image();

    private resizeTimeout?: any;
    private savedPixels?: Uint8ClampedArray;

    goalPercentage: number = 0;

    constructor(props: IGoalProps) {
        super(props);

        this.goalPercentage = this.props.current / this.props.goal;

        makeObservable(this, {
            goalPercentage: observable,
        });

        reaction(
            () => this.props.current,
            (current) => {
                this.goalPercentage = current / this.props.goal;

                if (this.goalPercentage > 1) this.goalPercentage = 1;
                else this.draw();
            }
        );

        reaction(
            () => this.props.goal,
            (goal) => {
                this.goalPercentage = this.props.current / goal;

                if (this.goalPercentage > 1) this.goalPercentage = 1;
                else this.draw();
            }
        );
    }

    componentDidMount() {
        this.setup();

        window.addEventListener("resize", this.onResize);
    }

    componentWillUnmount() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = undefined;
        }

        this.savedPixels = undefined;

        window.removeEventListener("resize", this.onResize);
    }

    render() {
        const { current, goal, type } = this.props;

        return (
            <div className={"goal"}>
                {type === "subs" && <h5>Cel subów</h5>}
                {type === "followers" && <h5>Cel followów</h5>}

                <canvas ref={this.canvasRef} />

                <div className={"text"}>
                    {current} / {goal}
                </div>
            </div>
        );
    }

    private setup() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const toOperate = windowWidth < windowHeight ? windowWidth : windowHeight;

        if (toOperate <= Goal.CIRCLE_MAX_SIZE) {
            this.canvasSize = toOperate;
        } else {
            if (this.canvasSize !== Goal.CIRCLE_MAX_SIZE) this.canvasSize = Goal.CIRCLE_MAX_SIZE;
        }

        if (!this.canvasRef.current) return;

        this.savedPixels = undefined;
        this.canvasRef.current.width = this.canvasSize;
        this.canvasRef.current.height = this.canvasSize;

        this.centerPosition = { x: this.canvasSize / 2, y: this.canvasSize / 2 };

        if (!this.canvasContext) this.canvasContext = this.canvasRef.current.getContext("2d");

        if (this.backgroundLoaded) this.draw();
        else {
            this.backgroundImage.src = "/assets/images/subs/miecioch.png";
            this.backgroundImage.onload = () => {
                this.backgroundLoaded = true;
                this.draw();
            };
        }
    }

    private draw() {
        if (!this.canvasContext) return;

        this.canvasContext.clearRect(0, 0, this.canvasSize, this.canvasSize);

        this.canvasContext.save();

        this.canvasContext.beginPath();
        this.canvasContext.arc(this.centerPosition.x, this.centerPosition.y, this.canvasSize / 2 - Goal.LINE_WIDTH, 0, 2 * Math.PI, false);
        this.canvasContext.closePath();
        this.canvasContext.clip();

        this.canvasContext.save();
        //this.canvasContext.globalAlpha = this.goalPercentage > 0.4 ? this.goalPercentage : 0.4;
        this.canvasContext.drawImage(this.backgroundImage, 0, 0, this.canvasSize, this.canvasSize);
        this.canvasContext.restore();

        this.canvasContext.beginPath();
        this.canvasContext.arc(this.centerPosition.x, this.centerPosition.y, this.canvasSize / 2, 2 * Math.PI, 0, true);
        this.canvasContext.clip();
        this.canvasContext.closePath();

        const imageData = this.canvasContext.getImageData(0, 0, this.canvasSize, this.canvasSize);

        if (!this.savedPixels) this.savedPixels = new Uint8ClampedArray(imageData.data);

        for (let i = 0; i < imageData.data.length; i += 4) {
            const average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

            imageData.data[i] = average;
            imageData.data[i + 1] = average;
            imageData.data[i + 2] = average;
            imageData.data[i + 3] = imageData.data[i + 3] ? 100 : imageData.data[i + 3];
        }

        const start = imageData.width * 4 * Math.round(imageData.height * (1 - this.goalPercentage));

        for (let i = start; i < imageData.data.length; i += 4) {
            imageData.data[i] = this.savedPixels[i];
            imageData.data[i + 1] = this.savedPixels[i + 1];
            imageData.data[i + 2] = this.savedPixels[i + 2];
            imageData.data[i + 3] = this.savedPixels[i + 3];
        }

        this.canvasContext.putImageData(imageData, 0, 0);

        this.canvasContext.restore();

        this.canvasContext.beginPath();
        this.canvasContext.arc(this.centerPosition.x, this.centerPosition.y, this.canvasSize / 2 - Goal.LINE_WIDTH, 0, 2 * Math.PI, false);
        this.canvasContext.arc(this.centerPosition.x, this.centerPosition.y, this.canvasSize / 2, 2 * Math.PI, 0, true);
        this.canvasContext.fillStyle = Goal.INNER_LINE_COLOR;
        this.canvasContext.fill();
        this.canvasContext.closePath();

        this.drawProgress();
    }

    private drawProgress() {
        let th1 = -90 * (Math.PI / 180),
            th2 = (this.goalPercentage * 360 - 90) * (Math.PI / 180),
            d1 = Goal.applyAngle(this.centerPosition, th1, this.canvasSize / 2),
            d2 = Goal.applyAngle(this.centerPosition, th2, this.canvasSize / 2 - Goal.LINE_WIDTH),
            magicGradient = this.canvasContext.createLinearGradient(d1.x, d1.y, d2.x, d2.y);

        magicGradient.addColorStop(0, "#ffc5e6");
        magicGradient.addColorStop(0.25, "#FCBCD7");
        magicGradient.addColorStop(0.5, "#F9A3CB");
        magicGradient.addColorStop(0.75, "#EF87BE");
        magicGradient.addColorStop(1, "#E56AB3");

        this.canvasContext.beginPath();
        this.canvasContext.arc(this.centerPosition.x, this.centerPosition.y, this.canvasSize / 2, th1, th2, false);
        this.canvasContext.arc(this.centerPosition.x, this.centerPosition.y, this.canvasSize / 2 - Goal.LINE_WIDTH, th2, th1, true);
        this.canvasContext.fillStyle = magicGradient;
        this.canvasContext.fill();
        this.canvasContext.closePath();
    }

    private onResize = () => {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);

        this.resizeTimeout = setTimeout(() => {
            this.setup();
        }, 100);
    };

    private static applyAngle(point: { x: number; y: number }, angle: number, distance: number) {
        return {
            x: point.x + Math.cos(angle) * distance,
            y: point.y + Math.sin(angle) * distance,
        };
    }
}

interface IGoalProps {
    current: number;
    goal: number;
    type: "followers" | "subs";
}
