import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";
import { ApiHelper } from "../helpers/ApiHelper";

export default class Track implements TrackData {
    public readonly title: string;
    public readonly artist: string;
    public readonly url: string;
    public readonly cover: string;
    public readonly duration: number;
    public readonly requester: string;

    public constructor(data: TrackData) {
        this.title = data.title;
        this.artist = data.artist;
        this.url = data.url;
        this.cover = data.cover;
        this.duration = data.duration;
        this.requester = data.requester;
    }

    public static from(query: string, apiHelper: ApiHelper, requester: string): Promise<Track | Track[]> {
        return new Promise((resolve, reject) => {
            let possibleTracks: Promise<Track | Track[]>

            // try to get a url from the query
            try {
                const url = new URL(query);

                switch (url.hostname) {
                    case "open.spotify.com":
                        if (url.pathname.includes("track")) {
                            possibleTracks = apiHelper.getSpotifyTrack(url.pathname.slice(7), requester);
                        }
                        else if (url.pathname.includes("album")) {
                            possibleTracks = apiHelper.getSpotifyAlbum(url.pathname.slice(7), requester);
                        }
                        else if (url.pathname.includes("playlist")) {
                            possibleTracks = apiHelper.getSpotifyPlaylist(url.pathname.slice(10), requester);
                        }
                        else {
                            return reject("Invalid Spotify media type!");
                        }
                        break;

                case "www.youtube.com":
                    case "youtube.com":
                        if (!url.searchParams.get("list") && url.searchParams.get("v")) {
                            possibleTracks = apiHelper.getYoutubeTrack(url.searchParams.get("v")!, requester);
                        }
                        else if (url.searchParams.get("list")) {
                            possibleTracks = apiHelper.getYoutubePlaylist(url.searchParams.get("list")!, requester);
                        }
                        else {
                            return reject("Invalid YouTube media type!");
                        }
                        break;

                    case "youtu.be":
                        possibleTracks = apiHelper.getYoutubeTrack(url.pathname.slice(1), requester);
                        break;

                    default:
                        return reject("Provide a Youtube or Spotify link!");
                }
            }
                // if it fails, search YouTube instead
            catch (err) {
                possibleTracks = apiHelper.searchYoutubeVideos(query, requester)
            }

            return possibleTracks!.then(resolve).catch(reject);
        });
    }

    /**
     * Creates an AudioResource from this Track.
     */
    public createAudioResource(quality: AudioQuality): Promise<AudioResource<Track>> {
        return new Promise((resolve, reject) => {
            const [frequency, bitrate, _quality] = AudioQualityPresets[quality];

            // i have no idea what this does
            const process = ytdl(
                this.url,
                {
                    o: '-',
                    q: _quality,
                    f: `bestaudio[ext=webm+acodec=opus+asr=${frequency}]/bestaudio`,
                    r: bitrate,
                },
                { stdio: ['ignore', 'pipe', 'ignore'] },
            );
            if (!process.stdout) {
                reject(new Error('No stdout'));
                return;
            }
            const stream = process.stdout;
            const onError = (error: Error) => {
                if (!process.killed) process.kill();
                stream.resume();
                reject(error);
            };
            process
                .once('spawn', () => {
                    demuxProbe(stream)
                        .then(probe => resolve(createAudioResource(probe.stream, {
                            metadata: this,
                            inputType: probe.type
                        })))
                        .catch(onError);
                })
                .catch(onError);
        });
    }

    public static getDefault() {
        return new Track({
            title: "Default",
            artist: "Default",
            url: "gg.com",
            cover: "https://i.ytimg.com/vi/uzP7EHVSNsQ/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCWDy1hiAmJLHesM4DdcDgxrskCSQ",
            requester: "Requester",
            duration: 123456
        });
    }
}

/**
 * This is the data required to create a Track object
 */
export interface TrackData {
    url: string,
    title: string,
    artist: string,
    cover: string,
    duration: number,
    requester: string,
}

export type AudioQuality = keyof typeof AudioQualityPresets;

export const AudioQualityPresets = {
    LOW: ["16000", "32K", "5"],
    MEDIUM: ["32000", "64K", "3"],
    HIGH: ["48000", "128K", "0"],
	ULTRA: ["48000", "256K", "0"],
} as const;
