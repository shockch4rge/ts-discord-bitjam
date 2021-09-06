import { Client, ColorResolvable, MessageEmbed, EmbedFieldData, Message } from 'discord.js'

// Use object over enum for JavaScript consistency
export const MessagePriority = {
    WARNING: "RED",
    SUCCESS: "GREEN",
    PROMPT: "PINK",
    NOTIF: "YELLOW",
    DEFAULT: "#2F3136",
} as const

export interface YoutubeOptions {
    maxResults: number,
    key: string,
    type: string,
}

export interface CreateEmbedOptions {
    bot: Client,
    author?: string,
    priority?: ColorResolvable,
    title?: string,
    description?: string,
    url?: string,
    fields?: EmbedFieldData[]
    imageUrl?: string,
    thumbnailUrl?: string,
    footer?: string, 
}

/**
 * 
 * @param opts Options for constructing the embed.
 * @returns A new {@link MessageEmbed}.
 */
export function createEmbed(opts: CreateEmbedOptions) {
    // Falsy values are allowed here as Discord will just evaluate them as being empty fields.
    return new MessageEmbed()
    .setAuthor(opts.author ?? "", opts.bot.user?.avatarURL({ format: 'png' }) ?? "")
    .setColor(opts.priority ?? MessagePriority.DEFAULT)
    .setTitle(opts.title ?? "")
    .setDescription(opts.description ?? "")
    .setURL(opts.url ?? "")
    .setFields(opts.fields ?? [])
    .setImage(opts.imageUrl ?? "")
    .setThumbnail(opts.thumbnailUrl ?? "")
    .setFooter(opts.footer ?? "");
}

export function delay(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export function formatDuration(ms: number) {
    const min = ms / 1000 / 60
    const sec = ms / 1000 % 60

    return min + ":" + ((sec < 10) ? "0" + sec : sec)
}

/**
 * Generates a warning message that deletes itself and the user message after a given time.
 * @param bot 
 * @param authorMessage 
 * @param title 
 * @param timeout  
 */
export async function warn(bot: Client, authorMessage: Message, title: string, timeout: number) {
    let warning = await authorMessage.channel.send({ 
        embeds: [createEmbed({
            bot: bot, author: title, priority: MessagePriority.WARNING 
        })
    ]});
    await delay(timeout);
    await warning.delete().catch();
    await authorMessage.delete().catch();
    return;
}