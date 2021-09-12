import { YT_TOKEN } from './auth.json'

export enum MessageLevel {
    WARNING = "RED",
    SUCCESS = "GREEN",
    PROMPT = "#DCBDFB",
    NOTIF = "YELLOW",
    DEFAULT = "#2F3136",
}

export const YoutubeOptions = { 
    maxResults: 1, 
    key: YT_TOKEN, 
    type: 'audio',
} as const

export function delay(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

export function formatDuration(ms: number) {
    const min = ms / 1000 / 60
    const sec = ms / 1000 % 60

    return `${min}:${(sec < 10) ? 0 + sec : sec}`
}