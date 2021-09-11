import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { initPlayer } from "../player";
import { handleUserNotConnected, MessageLevel } from "../utils";
import { deleteMessages, sendMessage, sendWarning } from "./messaging";

const COMMAND_PAUSE = /^>>pause/;

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", handleMessageCreate);
}

async function handleMessageCreate(message: Message) {
    if (message.author.bot) return;
    
    if (COMMAND_PAUSE.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }

        return await handlePauseCommand(message);
    }
}

// Main function
async function handlePauseCommand(message: Message) {
    // fix
    const player = initPlayer(message);

    if (!getVoiceConnection(message.guildId!)) {
        return await handlePlayerNotConnected(message);
    }

    if (player.state.status === AudioPlayerStatus.Paused || player.state.status === AudioPlayerStatus.AutoPaused) {
        return await handleAlreadyPaused(message);
    }

    const pauseSuccess = player.pause(true);

    if (!pauseSuccess) {
        return await handlePauseFailure(message);
    }

    const msg = await sendMessage(message, { author: "The player is now paused!", level: MessageLevel.SUCCESS });
    await deleteMessages([msg, message]);
}


async function handlePlayerNotConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is not connected to a voice channel!");
    await deleteMessages([warning, message]);
}

async function handleAlreadyPaused(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is already paused!");
    await deleteMessages([warning, message]);
}

async function handlePauseFailure(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "Failed to pause player.");
    await deleteMessages([warning, message]);
}