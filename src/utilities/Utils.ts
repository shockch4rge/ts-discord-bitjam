const auth = require("../../auth.json")

export const youtubeOptions = {
    maxResults: 1,
    key: auth.yt_token,
    type: 'audio',
} as const;

export function delay(ms: number): Promise<unknown> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

export function formatTime(ms: number): string {
    const min = ms / 1000 / 60;
    const sec = ms / 1000 % 60;

    return `${min}:${(sec < 10) ? "0" + sec : sec}`
}
