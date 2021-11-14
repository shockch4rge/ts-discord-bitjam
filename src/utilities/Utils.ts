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

export type SpotifyTrack =
    {
        album: {
            album_type: string,
            artists: [[Object]],
            external_urls: { spotify: string },
            href: string,
            id: string,
            images: [[Object]],
            name: string,
            release_date: string,
            release_date_precision: string,
            total_tracks: number,
            type: string,
            uri: string
        },
        artists: [
            {
                external_urls: [Object],
                href: string,
                id: string,
                name: string,
                type: string,
                uri: string
            }
        ],
        disc_number: number,
        duration_ms: number,
        explicit: boolean,
        external_ids: { isrc: string },
        external_urls: { spotify: string },
        href: string,
        id: string,
        is_local: boolean,
        is_playable: boolean,
        name: string,
        popularity: number,
        preview_url: string,
        track_number: number,
        type: string,
        uri: string,
        dominantColor: string
    }
