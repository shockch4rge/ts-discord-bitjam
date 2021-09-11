import { Message } from "discord.js";
import { createEmbed, CreateEmbedOptions, delay, MessageLevel } from "../utils";

export async function sendMessage(message: Message, content: CreateEmbedOptions) {
    const embed = createEmbed(content);
    return await message.channel.send({ embeds: [embed] });
}

export async function sendWarning(message: Message, content: string) {
    const embed = createEmbed({ author: content, level: MessageLevel.WARNING });
    return await message.channel.send({ embeds: [embed] });
}

export async function deleteMessages(messages: Message[], wait?: number) {
    await delay(wait ?? 5000);
    for (const message of messages) {
        await message.delete().catch();
    }
}