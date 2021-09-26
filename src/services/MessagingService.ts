import {ColorResolvable, EmbedFieldData, EmojiIdentifierResolvable, Message, MessageEmbed} from "discord.js";
import {delay} from "../utils";

export async function sendMessage(message: Message, embedOptions: CreateEmbedOptions): Promise<Message> {
    return await message.channel.send({embeds: [createEmbed(embedOptions)]});
}

export async function sendWarning(message: Message, content: string): Promise<Message> {
    return await message.channel.send({embeds: [createEmbed({author: content, level: MessageLevel.WARNING})]}).catch();
}

export async function deleteMessages(messages: Message[], wait?: number, interval?: number) {
    await delay(wait ?? 5000);
    for (const message of messages) {
        await delay(interval ?? 0);
        await message.delete().catch();
    }
}

export async function handleError(message: Message, embedOptions: CreateEmbedOptions, reaction?: EmojiIdentifierResolvable) {
    await message.react(reaction ?? "").catch();
    await message.channel.send({embeds: [createEmbed(embedOptions)]}).catch();
}

export function createEmbed(options: CreateEmbedOptions): MessageEmbed {
    return new MessageEmbed()
        .setAuthor(options.author ?? "", "https://cdn.discordapp.com/avatars/878323685272997958/024a3c27376cda14684aa3f84d2e421d.png")
        .setColor(options.level ?? MessageLevel.DEFAULT)
        .setTitle(options.title ?? "")
        .setURL(options.url ?? "")
        .setDescription(options.url ?? "")
        .setFields(options.fields ?? [])
        .setImage(options.imageUrl ?? "")
        .setThumbnail(options.thumbnailUrl ?? "")
        .setFooter(options.footer ?? "");
}

export type CreateEmbedOptions =
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
    NOTIFY = "YELLOW",
    DEFAULT = "#2F3136",
}

