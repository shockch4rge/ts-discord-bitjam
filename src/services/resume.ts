import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { initPlayer } from "../player";
import { handleUserNotConnected, MessageLevel } from "../utils";
import { sendMessage, deleteMessages, sendWarning } from "./messaging";

const COMMAND_RESUME = /^>>resume/;

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", handleMessageCreate);
}

async function handleMessageCreate(message: Message) {
    if (message.author.bot) return;

    if (COMMAND_RESUME.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }

        return await handleResumeCommand(message);
    }
}

// Main function
async function handleResumeCommand(message: Message) {
    // fix
    const player = initPlayer(message);

    if (!getVoiceConnection(message.guildId!)) {
        return await handlePlayerNotConnected(message);
    }

    if (player.state.status === AudioPlayerStatus.Playing) {
        await handleAlreadyPlaying(message);
        return;
    }

    // Resume
    const resumeSuccess = player.unpause();

    if (!resumeSuccess) {
        await handleResumeFailure(message);
        return;
    }

    const msg = await sendMessage(message, { author: "The player has resumed!", level: MessageLevel.SUCCESS });
    await deleteMessages([msg, message]);
}


async function handlePlayerNotConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is not connected to a voice channel!");
    await deleteMessages([warning, message]);
}

async function handleAlreadyPlaying(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is already playing!");
    await deleteMessages([warning, message]);
}

async function handleResumeFailure(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "Failed to resume player.");
    await deleteMessages([warning, message]);
}