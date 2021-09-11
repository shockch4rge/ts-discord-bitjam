import { getVoiceConnection } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { deleteMessages } from "./messaging";
import { sendWarning } from "./messaging";

const COMMAND_BYE = /^>>bye/;

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", handleMessageCreate);
}

async function handleMessageCreate(message: Message) {
    if (COMMAND_BYE.test(message.content)) {
        return await handleByeCommand(message);
    }
}

async function handleByeCommand(message: Message) {
    const connection = getVoiceConnection(message.guildId!);

    if (!connection) {
        handlePlayerNotConnected(message);
        return;
    }

    connection.destroy();
    connection.removeAllListeners();

    await deleteMessages([message]);
}

async function handlePlayerNotConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is not connected to a voice channel!");
    await deleteMessages([warning, message]);
}