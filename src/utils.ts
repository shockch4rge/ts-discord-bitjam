import { Client, ColorResolvable, MessageEmbed } from 'discord.js'

export enum MessagePriority {
    WARNING = "RED",
    SUCCESS = "GREEN",
    PROMPT = "PINK",
    NOTE = "#2F3136",
    DEFAULT = "GREY"
}

interface CreateEmbedOptions {
    bot: Client,
    author: string,
    title?: string,
    description?: string,
    priority?: ColorResolvable,
    image?: string,
    footer?: string, 
}

export const createEmbed = (opts: CreateEmbedOptions) => {
    return new MessageEmbed()
    .setAuthor(opts.author, opts.bot.user!.avatarURL({ format: 'png' })!)
    .setTitle(opts.title ?? "")
    .setDescription(opts.description ?? "")
    .setColor(opts.priority ?? MessagePriority.DEFAULT)
    .setImage(opts.image ?? "")
    .setFooter(opts.footer ?? "");
}

export const delay = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export const formatDuration = (ms: number) => {
    const min = ms / 1000 / 60
    const sec = ms / 1000 % 60

    return min + ":" + ((sec < 10) ? "0" + sec : sec)
}

export const warn = async (bot: Client, title: string) => {
    return createEmbed({
        bot: bot,
        author: title,
        priority: MessagePriority.WARNING
    })
}