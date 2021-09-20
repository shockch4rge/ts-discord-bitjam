import { createAudioPlayer, AudioPlayerStatus, getVoiceConnection, AudioPlayer } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { AudioResourceProcessor } from "./resource";
import { delay } from "../utils";
import { MessageLevel, deleteMessages, sendMessage, handleError } from "./messaging";
import { YouTubeSearchResults } from "youtube-search";

// If starts with '>>play ', contains 'http(s)://', chars 'a-z, 0-9, @, ., /, -', & ends with '.mp3'
const STRICT_COMMAND_PLAY = /^>>play\s(https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$)/i
const COMMAND_PLAY = /^>>play\s?/i
const COMMAND_RESUME = /^>>resume/;
const COMMAND_PAUSE = /^>>pause/;

let player: AudioPlayer;
const resourceProcessor = new AudioResourceProcessor();

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", async message => {
        return await handleMessageCreate(bot, message);
    });
    bot.on("ytUrlCreate", async (result: YouTubeSearchResults, message: Message) => {
        return await handleYoutubeResource(bot, result, message);
    });
}

async function handleMessageCreate(bot: Client, message: Message) {
    if (message.author.bot) return;

    if (COMMAND_PLAY.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleError(message, "You must be in a voice channel to use this command!", "❌");
        }
        return await handlePlayCommand(bot, message);
    }

    if (COMMAND_RESUME.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleError(message, "You must be in a voice channel to use this command!", "❌")
        }
        return await handleResumeCommand(message);
    }
    
    if (COMMAND_PAUSE.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleError(message, "You must be in a voice channel to use this command!", "❌")
        }

        return await handlePauseCommand(message);
    }
}

async function handleYoutubeResource(bot: Client, result: YouTubeSearchResults, message: Message) {
    const player = initPlayer(message); 
    const resource = await resourceProcessor.process(result.link);

    // Converted an invalid link
    if (!resource) {
        return await handleError(message, "Invalid resource!", "❗")
    }

    bot.emit("beforePlay", player, message);

    // Allow buffer
    await delay(1000);
    player.play(resource);

    const msg = await sendMessage(message, {  
        author: "Now playing...", 
        title: `${result.title.toString()}`,
        url: `${result.link}`,
        imageUrl: `${result.thumbnails.high?.url}`,
        level: MessageLevel.PROMPT,
    });

    await deleteMessages([message], 0);
    await deleteMessages([msg], 30000);
}

async function handlePlayCommand(bot: Client, message: Message) {
    const player = initPlayer(message);
    const matched = message.content.match(STRICT_COMMAND_PLAY);

    if (!matched) {
        return await handleError(message, "You didn't provide a valid mp3 file/link!", "❓");
    }

    const url = matched[1];
    const resource = await resourceProcessor.process(url);
    
    if (!resource) {
        return await handleError(message, "Invalid resource!", "❗");
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
        return await handleError(message, "The player is not connected to a voice channel!", "❌");
    }

    // Resume
    const resumeSuccess = player.unpause();
    
    if (!resumeSuccess) {
        return await handleError(message, "Failed to resume player.", "❌")
    }

    const msg = await sendMessage(message, { author: "The player has resumed!", level: MessageLevel.SUCCESS });
    await deleteMessages([msg, message]);
}

async function handlePauseCommand(message: Message) {
    if (!player) return;
    
    if (!getVoiceConnection) {
        return await handleError(message, "The player is not connected to a voice channel!", "❌");
    } 
    
    // Pause
    const pauseSuccess = player.pause(true);

    if (!pauseSuccess) {
        return await handleError(message, "Failed to pause player.", "❌");
    }

    await deleteMessages([message], 0);
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

