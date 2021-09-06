import { getVoiceConnection } from "@discordjs/voice";
import { Client, Message } from "discord.js";
import { initConnection, initPlayer } from "../player";
import { createEmbed, MessagePriority, warn } from "../utils";

export async function hiCommand(bot: Client, message: Message) {
    
    if (getVoiceConnection(message.guildId!)) {
        await message.react("❌").catch();
        await warn(bot, message, "The player is already connected to a voice channel!", 7000);
        return;
    }
    
    const player = initPlayer(bot, message);
    const connection = initConnection(player, bot, message);

    await message.delete().catch()
    await message.channel.send(
        { 
            embeds: [createEmbed({ 
                bot: bot, author: `Connected to ${message.member?.voice.channel}`, priority: MessagePriority.SUCCESS 
            })] 
        }
    );

}