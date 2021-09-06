import { Client, Message } from "discord.js";
import { createEmbed, delay, MessagePriority } from "../utils";

export async function pingCommand(bot: Client, message: Message) {
    const msg = await message.channel.send(
        { 
            embeds: [createEmbed({ 
                bot: bot, title: "Pong!  `" + bot.ws.ping + "ms`", priority: MessagePriority.SUCCESS 
            })] 
        }
    );
    await message.react("✅").catch();
    await delay(10000);
    await msg.delete().catch();
    await message.delete().catch();
    return;
}