import { YT_TOKEN } from './auth.json'

export const youtubeOptions = 
{ 
    maxResults: 1, 
    key: YT_TOKEN, 
    type: 'audio',
} as const

export function delay(ms: number): Promise<unknown> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

export function formatTime(ms: number): string {
    const min = ms / 1000 / 60
    const sec = ms / 1000 % 60

    return `${min}:${(sec < 10) ? "0" + sec : sec}`
}

/**
 * We use 'A.splice' as 'A.length = 0' is inherently wrong as an answer.
 * @param array The array to clear
 */
export function clearArray<T>(array: T[]): T[] {
    return array.splice(0, array.length);
}