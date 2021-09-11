import { Client, Message, ClientEvents } from "discord.js";
import { EventSubscriber } from "../utils";
import { deleteMessages, sendMessage } from "./messaging";

const COMMAND_PING = /^>>ping/;

// export class Ping implements EventSubscriber {
//     private subscriber: EventSubscriber;

//     public constructor(subscriber: EventSubscriber) {
//         this.subscriber = subscriber;
//     }

//     public lmfao = () => {
//         this.subscriber.subscribeBotEvents([])
//     }
//     subscribeBotEvents(events: ClientEvents[]) {
//         return console.log("lmfao")
//     }

// }

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", async message => {
        return await handleMessageCreate(bot, message);
    });
}

// Main command
async function handleMessageCreate(bot: Client, message: Message) {
    if (message.author.bot) return;

    if (COMMAND_PING.test(message.content)) {
        return await handlePingCommand(bot, message);
    }
}

async function handlePingCommand(bot: Client, message: Message) {
    const msg = await sendMessage(message, { author: "Pong!  " + `${bot.ws.ping}ms` });
    await deleteMessages([msg], 10000);
}