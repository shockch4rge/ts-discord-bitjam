import {Message} from "discord.js";

export abstract class Command {
    protected constructor(protected readonly message: Message) {}

    protected abstract execute():Promise<void>;
}