import { AudioResource } from "@discordjs/voice"

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

export type Resource = {
    create(): AudioResource,
}