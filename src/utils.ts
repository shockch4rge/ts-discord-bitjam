import { 
    ColorResolvable, 
    MessageEmbed, 
    EmbedFieldData,
    TextBasedChannels, 
} 
from 'discord.js'

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
    .setAuthor(opts.author ?? "", "https://cdn.discordapp.com/avatars/878323685272997958/024a3c27376cda14684aa3f84d2e421d.png")
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
 * Generates a warning message and sends it
 * @param content: 
 */
export async function sendWarning(content: string, channel: TextBasedChannels) {
    return await channel.send({ embeds: [createEmbed({ author: content, priority: MessagePriority.WARNING })] })
}