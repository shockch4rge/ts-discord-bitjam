import { Message } from "discord.js";
import { createEmbed, delay, MessagePriority } from "../utils";

export async function pingCommand(ping: number, message: Message) {
    const msg = await message.reply({ 
        embeds: [createEmbed({ 
            title: "Pong!  `" + ping + "ms`", 
            priority: MessagePriority.SUCCESS 
        })] 
    });
    await message.react("✅").catch();
    await delay(10000);
    await msg.delete().catch();
    await message.delete().catch();
    return;
}