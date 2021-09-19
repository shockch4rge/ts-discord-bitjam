import { getVoiceConnection } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { initPlayer } from "../player";
import { initConnection } from "../connection";
import { deleteMessages, sendWarning } from "./messaging";

const COMMAND_HI = /^>>hi/;

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", handleMessageCreate);
}

async function handleMessageCreate(message: Message) {
    if (message.author.bot) return;

    if (COMMAND_HI.test(message.content)) {
        return await handleHiCommand(message);
    }
}

// Main function
async function handleHiCommand(message: Message) {
    if (getVoiceConnection(message.guildId!)) {
        return await handlePlayerAlreadyConnected(message);
    }

    const player = initPlayer(message);
    const connection = initConnection(message);
    connection.subscribe(player)

    await deleteMessages([message]);
}


async function handlePlayerAlreadyConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is already connected to a voice channel!");
    await deleteMessages([warning, message]);
}