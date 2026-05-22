import { computed, makeObservable, observable } from "mobx";

import { EventModel, IEventModelSchema } from "./Event";

export class NormalEventModel extends EventModel {
    time?: number;

    constructor(data: IEventModelSchema) {
        super(data);

        makeObservable(this, {
            time: observable,
            formattedTime: computed,
        });
    }

    get formattedTime(): string | null {
        if (typeof this.time === "undefined") return null;

        const hours = Math.floor(this.time / 3600);
        const minutes = Math.floor(this.time / 60) % 60;
        const seconds = this.time % 60;

        return [hours, minutes, seconds]
            .map((v) => (v < 10 ? "0" + v : v))
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    }
}
