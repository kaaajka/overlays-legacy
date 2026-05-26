export interface IEventModelSchema {
  id: string;
  key: string;
  name: string;
  description: string;
}

export enum EventState {
  PREPARE = "prepare",
  STARTED = "started",
  FINISHED = "finished",
}

export class EventModel {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;

  state: EventState = EventState.PREPARE;

  constructor(data: IEventModelSchema) {
    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.description = data.description;
  }

  update(args: Record<string, unknown>) {
    for (const [key, value] of Object.entries(args)) {
      if (!Object.hasOwn(this, key)) continue;

      if (key === "state") {
        if (Object.values(EventState).includes(value as EventState)) {
          this.state = value as EventState;
        }

        continue;
      }

      // biome-ignore lint/suspicious/noExplicitAny: Legacy dynamic model update boundary; proper removal requires a typed model-update contract.
      (this as any)[key] = value;
    }
  }
}
