import {Client, Message} from "discord.js";
import {deleteMessages, sendMessage} from "../services-old/messaging";
import {Receiver} from "./Receiver";

export class PingReceiver implements Receiver {
    public readonly callables: Function[];

    public constructor() {
        this.callables = [
            this.sendPingStatus,
        ];
    }

    public async sendPingStatus(message: Message, bot: Client) {
        const msg = await sendMessage(message, { title: "Pong!  `" + bot.ws.ping + "ms`"});
        await deleteMessages([msg], 7000);
    }
}