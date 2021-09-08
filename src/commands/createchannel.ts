import { Client, Message } from "discord.js";
import { createEmbed, delay, MessagePriority, sendWarning } from "../utils";

export async function createChannelCommand(bot: Client, message: Message) {
    const guild = bot.guilds.cache.get(message.guildId!);
    // Guild doesn't exist after command is executed
    if (!guild) return;

    // If channel exists with the same name, don't create a new one
    for await (const [id, channel] of guild.channels.cache) {
        if (channel.name.match(/^bitjam-song-requests/)) {
            const warning = await sendWarning("The channel already exists!", message.channel);
            await delay(7000);
            await warning.delete().catch();
            await message.delete().catch();
            return;
        }
    }

    const channel = await guild.channels.create("bitjam song requests", { 
        type: "GUILD_TEXT", permissionOverwrites: [{ 
            id: message.guild!.id, 
            allow: ['VIEW_CHANNEL'] 
        }] 
    });

    const mainMessage = await channel.send({
        content: "__**Queue List:**__",
        embeds: [createEmbed({
            author: "Enter a song to search for!",
            imageUrl: "https://images-ext-1.discordapp.net/external/tLPlR6u8-h9qOxSFhC43tk4z7cHjZsrrhcd3SSKgwPY/https/cdn.hydra.bot/hydra_no_music.png?width=1595&height=897",
            priority: MessagePriority.PROMPT,
            footer: "Duration: --:--"
        })]
    });

    await mainMessage.react("⏯️").catch();
    await mainMessage.react("⏹️").catch();
    await mainMessage.react("⏭️").catch();
}