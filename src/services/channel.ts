import { AudioPlayer, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { MessageLevel } from "../utils";
import { deleteMessages, sendMessage, sendWarning, handleUserNotConnected } from "./messaging";

const COMMAND_HI = /^>>hi/;
const COMMAND_BYE = /^>>bye/;

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", async message => {
        return await handleMessageCreate(bot, message);
    });
    bot.on("beforePlay", handleBeforePlay);
}

async function handleMessageCreate(bot: Client, message: Message) {
    if (message.author.bot) return;

    if (COMMAND_HI.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }
        return await handleHiCommand(bot, message);
    }

    if (COMMAND_BYE.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }
        return await handleByeCommand(bot, message);
    }
}

async function handleHiCommand(bot: Client, message: Message) {
    if (getVoiceConnection(message.guildId!)) {
        return await handlePlayerAlreadyConnected(message);
    }

    const connection = initConnection(message);
    await deleteMessages([message]);
}

async function handleByeCommand(bot: Client, message: Message) {
    const connection = getVoiceConnection(message.guildId!);

    if (!connection) {
        return await handlePlayerNotConnected(message);
    }

    connection?.destroy();
    await deleteMessages([message]);
}

function handleBeforePlay(player: AudioPlayer, message: Message) {
    const connection = initConnection(message)
    connection.subscribe(player);
}

async function handlePlayerAlreadyConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is already connected to a voice channel!");
    await deleteMessages([warning, message]);
}

async function handlePlayerNotConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The player is not connected to a voice channel!");
    await deleteMessages([warning, message]);
}

/**
 * Connects to a voice channel and initialises its listeners.
 * @param player The player to establish a connection for
 * @param message The user's message to infer voice connection details from
 * @returns A {@link VoiceConnection}
 */
function initConnection(message: Message) {
    const connection = joinVoiceChannel({
        guildId: message.guildId!,
        channelId: message.member!.voice.channelId!,
        adapterCreator: message.guild!.voiceAdapterCreator
    });

    // Listeners
    connection.on("stateChange", async (oldState, newState) => {
        const newStatus = newState.status

        // Connection is established; can start playing
        if (newStatus === VoiceConnectionStatus.Ready) {
            // No users in the vc before connection is established
            if (!message.member!.voice.channel!) {
                const warning = await sendWarning(message, "You left the voice channel before the player could connect!");
                return await deleteMessages([warning]);
            }

            const msg = await sendMessage(message, { 
                author: `Connected to: ${message.member!.voice.channel!.name}`, 
                level: MessageLevel.SUCCESS 
            });
            return await deleteMessages([msg]);
        }

        // The connection is disrupted. Can be manual or connection issues
        else if (newStatus === VoiceConnectionStatus.Disconnected) {
            // Was manually disconnected by a user
            if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose) {
                return connection.destroy();
            }

            // Else, attempt to reconnect to the voice channel
            while (connection.rejoinAttempts < 4) {
                connection.rejoin();

                // Check if it enters the Ready status within 5 seconds
                try {
                    await entersState(connection, VoiceConnectionStatus.Ready, 5000);
                    return;
                } 
                // Otherwise, continue to reconnect until limit is reached
                catch {
                    continue;
                }
            }

            connection.destroy()
            const warning = await sendWarning(message, "The player could not reconnect to the channel. Try again later?");
            return await deleteMessages([warning]);
        } 

        // Connection to the voice channel is manually destroyed.
        else if (newStatus === VoiceConnectionStatus.Destroyed) {
            const msg = await sendMessage(message, { author: "Disconnected. Bye!", level: MessageLevel.NOTIF })
            return await deleteMessages([msg]);
        }
    });

    connection.on("error", console.log);

    return connection;
}