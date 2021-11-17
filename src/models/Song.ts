import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from 'youtube-dl-exec';
import { ApiHelper } from "../helpers/ApiHelper";

export default class Song implements SongData {
    public readonly url: URL;
    public readonly title: string;
    public readonly artist: string;
    public readonly cover: string;
    public readonly duration: number;
    public readonly requester: string;

    private constructor(data: SongData) {
        this.url = data.url;
        this.title = data.title;
        this.artist = data.artist;
        this.cover = data.cover;
        this.duration = data.duration
        this.requester = data.requester
    }

    public static async from(url: string, apiHelper: ApiHelper, requester: string) {
        const source = new URL(url);
        return new Song({
            url: source,
            title: "lol",
            requester: requester,
            cover: "",
            artist: "deez nuts",
            duration: 0
        })
    }

    /**
     * Creates an AudioResource from this Song.
     */
    public createAudioResource(): Promise<AudioResource<Song>> {
        return new Promise((resolve, reject) => {
            // i have no idea what this does
            const process = ytdl(
                this.url.toString(),
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
    url: URL,
    title: string,
    artist: string,
    cover: string,
    duration: number,
    requester: string,
}
