interface IQueueEventSchema {
    id: string;
    name: string;
    username: string;
}

export class QueueEventModel {
    readonly id: string;
    readonly name: string;
    readonly username: string;

    constructor(data: IQueueEventSchema) {
        this.id = data.id;
        this.name = data.name;
        this.username = data.username;
    }
}
