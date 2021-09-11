import { 
    ColorResolvable, 
    MessageEmbed, 
    EmbedFieldData,
    Message,
    ClientEvents, 
} 
from 'discord.js'

import { deleteMessages, sendWarning } from './services/messaging';

import { YT_TOKEN } from './auth.json'

// Use object over enum for JavaScript consistency
export enum MessageLevel {
    WARNING = "RED",
    SUCCESS = "GREEN",
    PROMPT = "LUMINOUS_VIVID_PINK",
    NOTIF = "YELLOW",
    DEFAULT = "#2F3136",
}

export const YoutubeOptions = { 
    maxResults: 1, 
    key: YT_TOKEN, 
    type: 'audio' 
} as const;

export interface CreateEmbedOptions {
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

// Migrate to classes
export interface CommandInterface {
    subscribeBotEvents: (event: ClientEvents) => void
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

export async function handleUserNotConnected(message: Message) {
    await message.react("❌").catch();
    const warning = await sendWarning(message, "You must be in a voice channel to use this command!");
    await deleteMessages([warning]);
}