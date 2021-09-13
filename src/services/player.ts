import { createAudioPlayer, AudioPlayerStatus, getVoiceConnection, AudioPlayer, AudioResource } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { MP3Resource, ResourceFactory, YoutubeResource } from "./resource";
import { MessageLevel, delay } from "../utils";
import { sendWarning, deleteMessages, sendMessage, handleUserNotConnected } from "./messaging";
import { YouTubeSearchResults } from "youtube-search";

// If starts with '>>play ', contains 'http(s)://', chars 'a-z, 0-9, @, ., /, -', & ends with '.mp3'
const STRICT_COMMAND_PLAY = /^(>>play)(\s?https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$)/i
const COMMAND_PLAY = /^>>play\s?/i
const COMMAND_RESUME = /^>>resume/;
const COMMAND_PAUSE = /^>>pause/;

let player: AudioPlayer;
const resourceFactory = new ResourceFactory();

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", async message => {
        return await handleMessageCreate(bot, message);
    });
    bot.on("youtubeLinkFetch", async (url: string, message: Message) => {
        return await handleYoutubeResource(bot, url, message);
    });
}

async function handleMessageCreate(bot: Client, message: Message) {
    if (message.author.bot) return;

    if (COMMAND_PLAY.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }
        return await handlePlayCommand(bot, message);
    }

    if (COMMAND_RESUME.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }
        return await handleResumeCommand(message);
    }
    
    if (COMMAND_PAUSE.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }
        return await handlePauseCommand(message);
    }
}

async function handleYoutubeResource(bot: Client, url: string, message: Message) {
    const player = initPlayer(message); 
    const resource = resourceFactory.make(new YoutubeResource(url));

    // Youtube returned an invalid link
    if (!resource) {
        return await handleInvalidResource(message);
    }

    bot.emit("beforePlay", player, message);

    // Allow buffer
    await delay(1000);
    player.play(resource);
}

async function handlePlayCommand(bot: Client, message: Message) {
    const player = initPlayer(message);
    const matched = message.content.match(STRICT_COMMAND_PLAY);

    if (!matched) {
        return await handleInvalidMatch(message);
    }

    const url = matched[2].trim();
    const resource = resourceFactory.make(new MP3Resource(url));
    
    if (!resource) {
        return await handleInvalidResource(message);
    }

    bot.emit("beforePlay", player, message);

    // Allow buffer
    await delay(1000);
    player.play(resource);

    await deleteMessages([message], 0);
}

async function handleResumeCommand(message: Message) {
    if (!player) return;

    if (!getVoiceConnection(message.guildId!)) {
        return await handlePlayerNotConnected(message);
    }

    // Resume
    const resumeSuccess = player.unpause();
    
    if (!resumeSuccess) {
        return await handleResumeFailure(message);
    }

    const msg = await sendMessage(message, { author: "The player has resumed!", level: MessageLevel.SUCCESS });
    await deleteMessages([msg, message]);
}

async function handlePauseCommand(message: Message) {
    if (!player) return;
    
    if (!getVoiceConnection) {
        return await handlePlayerNotConnected(message);
    } 
    
    // Pause
    const pauseSuccess = player.pause(true);

    if (!pauseSuccess) {
        return await handlePauseFailure(message);
    }

    const msg = await sendMessage(message, { author: "The player has paused!", level: MessageLevel.SUCCESS });
    await deleteMessages([msg, message]);
}

async function handlePlayerNotConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is not connected to a voice channel!");
    await deleteMessages([warning, message]);
}

async function handleInvalidMatch(message: Message) {
    await message.react("❓").catch();
    const warning = await sendWarning(message, "You didn't provide a valid mp3 file/link!");
    await deleteMessages([warning, message]);
}

async function handleInvalidResource(message: Message) {
    await message.react("❗").catch();
    const warning = await sendWarning(message, "Invalid resource!");
    await deleteMessages([warning, message]);
}

async function handlePauseFailure(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "Failed to pause player.");
    await deleteMessages([warning, message]);
}

async function handleResumeFailure(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "Failed to resume player.");
    await deleteMessages([warning, message]);
}

function initPlayer(message: Message) {
    if (!player) {
        player = createAudioPlayer();
    }

    // Listeners
    player.on("stateChange", async (oldState, newState) => {
        const newStatus = newState.status;
        const oldStatus = oldState.status;

        console.log(`Went from ${oldStatus} to ${newStatus}`);

        // Possibly caused by buffering issues
        if (oldStatus === AudioPlayerStatus.AutoPaused && newStatus === AudioPlayerStatus.Playing) {
            return;
        }

        // Only fires if player is manually paused by user. 'AutoPaused' status can happen when player is idle
        if (newStatus === AudioPlayerStatus.Paused) {
            const msg = await sendMessage(message, { author: "The player is now paused!", level: MessageLevel.SUCCESS });
            return await deleteMessages([msg]);
        }

        // The player is currently playing a resource. Possible 'Buffering' status can happen
        else if (newStatus === AudioPlayerStatus.Playing) {
            const msg = await sendMessage(message, { author: "Playing...", level: MessageLevel.SUCCESS });
            return await deleteMessages([msg]);
        }

        // The player has probably finished playing 
        else if (newStatus === AudioPlayerStatus.Idle) {
            const msg = await sendMessage(message, { author: "Finished playing!", level: MessageLevel.NOTIF });
            return await deleteMessages([msg]);
        }
    });

    player.on('error', console.log);

    return player;
}

