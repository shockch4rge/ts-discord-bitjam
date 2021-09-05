import { Client, Message } from "discord.js";
import { createEmbed, delay, MessagePriority } from "../utils";

export const ping = async (bot: Client, message: Message) => {
    const embed = createEmbed({ 
        bot: bot, author: "Pong!  `" + bot.ws.ping + "ms`", priority: MessagePriority.SUCCESS 
    });
    const msg = await message.channel.send({ embeds: [embed] });
    await message.react("✅").catch();
    await delay(10000);
    await message.delete().catch();
    await msg.delete().catch();
    return;
}