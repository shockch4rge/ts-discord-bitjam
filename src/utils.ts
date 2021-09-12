import { Message }from 'discord.js'
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
} as const

export function delay(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export function formatDuration(ms: number) {
    const min = ms / 1000 / 60
    const sec = ms / 1000 % 60

    return `${min}:${((sec < 10) ? 0 + sec : sec)}`
}