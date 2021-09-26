import {Client, Message} from "discord.js";
import {Receiver} from "./Receiver";
import {deleteMessages, sendMessage} from "../services/MessagingService";

export class PingReceiver implements Receiver {
    public readonly callables: Function[];

    public constructor() {
        this.callables = [this.sendPingStatus,];
    }

    public async sendPingStatus(message: Message, bot: Client) {
        const msg = await sendMessage(message, {title: "Pong!  `" + bot.ws.ping + "ms`"})
        await deleteMessages([msg], 7000);
    }
}