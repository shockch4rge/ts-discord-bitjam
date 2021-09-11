import { Client, Message } from "discord.js";
import { deleteMessages, sendMessage } from "./messaging";

const COMMAND_PING = /^>>ping/;

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", async message => {
        return await handleMessageCreate(bot, message);
    });
}

// Main command
async function handleMessageCreate(bot: Client, message: Message) {
    if (COMMAND_PING.test(message.content)) {
        return await handlePingCommand(bot, message);
    }
}

async function handlePingCommand(bot: Client, message: Message) {
    const msg = await sendMessage(message, { author: "Pong!  " + `${bot.ws.ping}ms` });
    await deleteMessages([msg], 10000);
}