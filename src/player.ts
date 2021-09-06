import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { createEmbed, delay, MessagePriority } from "./utils";
import ytdl from "ytdl-core"

export function initPlayer(bot: Client, message: Message) {
    const player = createAudioPlayer();
 
    // Listeners
    player.on("stateChange", async (oldState, newState) => {
        const newStatus = newState.status;

        if (newStatus === AudioPlayerStatus.AutoPaused || newStatus === AudioPlayerStatus.Paused) {
            const msg = await message.channel.send(
                { 
                    embeds: [createEmbed(
                    { bot: bot, author: "The player is now paused!", priority: MessagePriority.SUCCESS 
                })] 
            });
            await delay(5000);
            await msg.delete().catch();
            return;
        }
        else if (newStatus === AudioPlayerStatus.Playing) {
            const msg = await message.channel.send(
                { 
                    embeds: [createEmbed({ 
                    bot: bot, author: "Playing...", priority: MessagePriority.SUCCESS 
                })] 
            });
            await delay(5000);
            await msg.delete().catch();
            return;
        } 
        else if (newStatus === AudioPlayerStatus.Idle) {
            const msg = await message.channel.send(
                { 
                    embeds: [createEmbed({ 
                    bot: bot, author: "Finished playing!", priority: MessagePriority.NOTIF 
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

export function initConnection(player: AudioPlayer, bot: Client, message: Message) {
    const connection = joinVoiceChannel(
        {
            guildId: message.guildId!,
            channelId: message.member!.voice.channelId!,
            adapterCreator: message.guild!.voiceAdapterCreator
        }
    );

    // Listeners
    connection.on("stateChange", async (oldState, newState) => {
        const newStatus = newState.status

        if (newStatus === VoiceConnectionStatus.Disconnected) {
            const msg = await message.channel.send(
                { 
                    embeds: [createEmbed({ 
                    bot: bot, author: "Disonnected. Bye!", priority: MessagePriority.NOTIF
                })] 
            });
            await delay(10000);
            await msg.delete().catch();
            return;
        }
    });

    connection.on("error", err => {
        console.log(err);
    });

    connection.subscribe(player);
    
    return connection;
}

export function initMp3Resource(url: string) {
    // Needs stronger verification
    const mp3Regex = new RegExp(/mp3/);

    if (!mp3Regex.test(url)) {
        // Not valid file format
        return undefined;
    }

    return createAudioResource(url);
}

export function initYoutubeResource(url: string) {
    if (!ytdl.validateURL(url)) {
        // Not a valid URL
        return undefined;
    }

    const stream = ytdl(url, { filter: 'audioonly' })
    return createAudioResource(stream);
}