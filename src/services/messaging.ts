import { ColorResolvable, EmbedFieldData, EmojiIdentifierResolvable, Message, MessageEmbed } from "discord.js";
import { delay } from "../utils";

export async function sendMessage(message: Message, content: CreateEmbedOptions) {
    const embed = createEmbed(content);
    return await message.channel.send({ embeds: [embed] }).catch();
}

export async function sendWarning(message: Message, content: string) {
    const embed = createEmbed({ author: content, level: MessageLevel.WARNING });
    return await message.channel.send({ embeds: [embed] }).catch();
}

export async function deleteMessages(messages: Message[], wait?: number) {
    await delay(wait ?? 5000);
    for (const message of messages) {
        await message.delete().catch();
    }
}

export async function handleError(message: Message, reason: string, reaction?: EmojiIdentifierResolvable) {
    await message.react(reaction ?? "").catch();
    const warning = await sendWarning(message, reason);
    await deleteMessages([warning, message]);
}

/**
 * 
 * @param opts Options for constructing the embed.
 * @returns A new {@link MessageEmbed}.
 */
 export function createEmbed(opts: CreateEmbedOptions) {
    // Falsy values are allowed here as Discord will just evaluate them as being empty fields.
    return new MessageEmbed()
    .setAuthor(opts.author ?? "", "https://cdn.discordapp.com/avatars/878323685272997958/024a3c27376cda14684aa3f84d2e421d.png")
    .setColor(opts.level ?? MessageLevel.DEFAULT)
    .setTitle(opts.title ?? "")
    .setDescription(opts.description ?? "")
    .setURL(opts.url ?? "")
    .setFields(opts.fields ?? [])
    .setImage(opts.imageUrl ?? "")
    .setThumbnail(opts.thumbnailUrl ?? "")
    .setFooter(opts.footer ?? "");
}

type CreateEmbedOptions = 
{
    author?: string,
    level?: ColorResolvable,
    title?: string,
    description?: string,
    url?: string,
    fields?: EmbedFieldData[],
    imageUrl?: string,
    thumbnailUrl?: string,
    footer?: string, 
}

export enum MessageLevel 
{
    WARNING = "RED",
    SUCCESS = "GREEN",
    PROMPT = "#DCBDFB",
    NOTIF = "YELLOW",
    DEFAULT = "#2F3136",
}