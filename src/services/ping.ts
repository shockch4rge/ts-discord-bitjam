import { Client, Message } from "discord.js";
import { MessageLevel, deleteMessages, sendMessage } from "./messaging";

const COMMAND_PING = /^>>ping/;

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
    const msg = await sendMessage(message, { title: "Pong!  `" + bot.ws.ping + "ms`", level: MessageLevel.NOTIF });
    await deleteMessages([message], 0);
    await deleteMessages([msg], 8000);
}