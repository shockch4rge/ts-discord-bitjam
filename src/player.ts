import { 
    AudioPlayer, 
    AudioPlayerStatus, 
    createAudioPlayer, 
    createAudioResource, 
} 
from "@discordjs/voice";
import { Message } from "discord.js";
import { createEmbed, delay, MessagePriority } from "./utils";
import ytdl from "ytdl-core"

var player: AudioPlayer;

/**
 * Creates a player and initialises its listeners.
 * @param message The user message
 * @returns An {@link AudioPlayer}.
 */
export function initPlayer(message: Message) {
    if (!player) {
        player = createAudioPlayer()
    }
    
    // Listeners
    player.on("stateChange", async (oldState, newState) => {
        const newStatus = newState.status;
        const oldStatus = oldState.status;

        console.log(`Went from ${oldStatus} to ${newStatus}`);

        // Possibly caused by buffering issues
        if (oldStatus === AudioPlayerStatus.AutoPaused && newStatus === AudioPlayerStatus.Playing) {
            // prevent other listeners from firing
            return;
        }

        // Only fires if player is manually paused by user. 'AutoPaused' status can happen when player is idle
        if (newStatus === AudioPlayerStatus.Paused) {
            const msg = await message.channel.send({ 
                embeds: [createEmbed({ 
                    author: "The player is now paused!", 
                    priority: MessagePriority.SUCCESS 
                })] 
            });
            await delay(5000);
            await msg.delete().catch();
            return;
        }

        // The player is currently playing a resource. Possible 'Buffering' status can happen
        else if (newStatus === AudioPlayerStatus.Playing) {
            const msg = await message.channel.send({ 
                embeds: [createEmbed({ 
                    author: "Playing...", 
                    priority: MessagePriority.SUCCESS 
                })] 
            });
            await delay(5000);
            await msg.delete().catch();
            return;
        }

        // The player has probably finished playing 
        else if (newStatus === AudioPlayerStatus.Idle) {
            const msg = await message.channel.send({ 
                embeds: [createEmbed({ 
                    author: "Finished playing!", 
                    priority: MessagePriority.NOTIF 
                })] 
            });
            await delay(10000);
            await msg.delete().catch();

            return;
        }
    });

    player.on('error', err => {
        console.log(err)
    });

    return player;
}

export function initMp3Resource(url: string) {
    return createAudioResource(url);
}

/**
 * 
 * @param url The Youtube URL to convert into an {@link AudioResource}
 * @returns An {@link AudioResource} if it's a valid Youtube URL, otherwise undefined.
 */
export function initYoutubeResource(url: string) {
    if (!ytdl.validateURL(url)) {
        // Not a valid URL, return undefined to handle
        return undefined;
    }

    // Convert YouTube URL to a readable stream
    const stream = ytdl(url, { filter: 'audioonly' })
    return createAudioResource(stream);
}