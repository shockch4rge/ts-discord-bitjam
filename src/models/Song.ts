import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from 'youtube-dl-exec';
import { ApiHelper } from "../helpers/ApiHelper";

export default class Song implements SongData {
    public readonly title: string;
    public readonly artist: string;
    public readonly url: string;
    public readonly cover: string;
    public readonly duration: number;
    public readonly requester: string;

    public constructor(data: SongData) {
        this.title = data.title;
        this.artist = data.artist;
        this.url = data.url;
        this.cover = data.cover;
        this.duration = data.duration;
        this.requester = data.requester;
    }

    public static from(_url: string, apiHelper: ApiHelper, requester: string): Promise<Song> {
        return new Promise((resolve, reject) => {
            const url = new URL(_url);

            switch (url.hostname) {
                case "open.spotify.com":
                    // https://open.spotify.com/track/[trackId]?si=[something]
                    return apiHelper.getSpotifySong(url.pathname.slice(7), requester)
                        .then(resolve)
                        .catch(reject);

                case "www.youtube.com":
                    // https://www.youtube.com/watch?v=[videoId]
                    return apiHelper.getYoutubeSong(url.searchParams.get("v")!, requester)
                        .then(resolve)
                        .catch(reject);

                case "youtu.be":
                    // https://youtu.be/[videoId]
                    return apiHelper.getYoutubeSong(url.pathname.slice(1), requester)
                        .then(resolve)
                        .catch(reject);

                default:
                    reject("Provide a Youtube or Spotify link!");
            }
        });
    }

    /**
     * Creates an AudioResource from this Song.
     */
    public createAudioResource(): Promise<AudioResource<Song>> {
        return new Promise((resolve, reject) => {
            // i have no idea what this does
            const process = ytdl(
                this.url,
                {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '100K',
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
        return new Song({
            title: "Default",
            artist: "Default",
            url: "gg.com",
            cover: "https://i.ytimg.com/vi/uzP7EHVSNsQ/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCWDy1hiAmJLHesM4DdcDgxrskCSQ",
            requester: "Requester",
            duration: 123456
        })
    }


    // /**
    //  * Creates a Song from a video URL and lifecycle callback methods.
    //  *
    //  * @param url The URL of the video
    //  * @param methods Lifecycle callbacks
    //  * @returns The created Song
    //  */
    // public static async from(url: string, {
    //     onStart,
    //     onFinish,
    //     onError
    // }: Pick<Song, 'onStart' | 'onFinish' | 'onError'>): Promise<Song> {
    //     // The methods are wrapped so that we can ensure that they are only called once.
    //     const wrappedMethods = {
    //         onStart() {
    //             wrappedMethods.onStart = noop;
    //             onStart();
    //         },
    //         onFinish() {
    //             wrappedMethods.onFinish = noop;
    //             onFinish();
    //         },
    //         onError(error: Error) {
    //             wrappedMethods.onError = noop;
    //             onError(error);
    //         },
    //     };
    //
    //     return new Song({
    //         title: getInfo(url).read().title,
    //         url,
    //         ...wrappedMethods,
    //     });
    // }
}

/**
 * This is the data required to create a Song object
 */
export interface SongData {
    url: string,
    title: string,
    artist: string,
    cover: string,
    duration: number,
    requester: string,
}
