import {Client} from "discord.js";
import {Service} from "./Service";

export class BotService implements Service {
    private readonly bot: Client;

    public constructor(bot: Client) {
        this.bot = bot;
    }

    resumeService(): Promise<void> {
        return Promise.resolve(undefined);
    }

    suspendService(): Promise<void> {
        return Promise.resolve(undefined);
    }

}