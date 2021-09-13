import { Client, Guild, Message } from "discord.js";
import { MessageLevel } from "../utils";
import { createEmbed, deleteMessages, sendWarning } from "./messaging";

const COMMAND_CHANNEL = /^>>channel/;
const CHANNEL_NAME = /^bitjam-requests/

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", async message => {
        return await handleMessageCreate(bot, message);
    });
}

async function handleMessageCreate(bot: Client, message: Message) {
    if (message.author.bot) return;

    if (COMMAND_CHANNEL.test(message.content)) {
        const guild = bot.guilds.cache.get(message.guildId!);

        // Guild doesn't exist after command is executed
        if (!guild) return;

        return await handleChannelCommand(guild, message);
    }
}

// Main function
async function handleChannelCommand(guild: Guild, message: Message) {
    for (const [id, channel] of guild.channels.cache) {
        if (channel.name.match(CHANNEL_NAME) && id === channel.id) {
            return await handleChannelAlreadyExists(message);
        }
    }

    const channel = await guild.channels.create("bitjam requests", { 
        type: "GUILD_TEXT", 
        permissionOverwrites: [{ 
            id: message.guild!.id, 
            allow: ['VIEW_CHANNEL'] 
        }] 
    });

    const mainMessage = await channel.send({
        content: "__**Queue List:**__",
        embeds: [createEmbed({
            author: "Enter a song to search for!",
            imageUrl: "https://i.kym-cdn.com/entries/icons/facebook/000/000/091/TrollFace.jpg",
            level: MessageLevel.PROMPT,
            footer: "Duration: --:--",
        })]
    });

    await mainMessage.react("⏯️").catch();
    await mainMessage.react("⏹️").catch();
    await mainMessage.react("⏭️").catch();
    await mainMessage.react("🔁").catch();
}


async function handleChannelAlreadyExists(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "The channel already exists!");
    await deleteMessages([warning, message]);
}