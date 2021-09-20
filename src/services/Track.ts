import {AudioResource, createAudioResource, demuxProbe} from "@discordjs/voice";
import getInfo from "ytdl-core";
import {raw as ytdl} from 'youtube-dl-exec';

export default class Track implements TrackData {
    public readonly url: string;
    public readonly title: string;
    public readonly onStart: () => void;
    public readonly onFinish: () => void;
    public readonly onError: (error: Error) => void;

    private constructor(track: TrackData) {
        this.url = track.url;
        this.title = track.title;
        this.onStart = track.onStart;
        this.onFinish = track.onFinish;
        this.onError = track.onError;
    }

    /**
     * Creates an AudioResource from this Track.
     */
    public create(): Promise<AudioResource<Track>> {
        return new Promise((resolve, reject) => {
            const process = ytdl(
                this.url,
                {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '100K',
                },
                {stdio: ['ignore', 'pipe', 'ignore']},
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
                        .then((probe) => resolve(createAudioResource(probe.stream, {
                            metadata: this,
                            inputType: probe.type
                        })))
                        .catch(onError);
                })
                .catch(onError);
        });
    }

    /**
     * Creates a Track from a video URL and lifecycle callback methods.
     *
     * @param url The URL of the video
     * @param methods Lifecycle callbacks
     * @returns The created Track
     */
    public static async from(url: string, {
        onStart,
        onFinish,
        onError
    }: Pick<Track, 'onStart' | 'onFinish' | 'onError'>): Promise<Track> {
        // The methods are wrapped so that we can ensure that they are only called once.
        const wrappedMethods = {
            onStart() {
                wrappedMethods.onStart = noop;
                onStart();
            },
            onFinish() {
                wrappedMethods.onFinish = noop;
                onFinish();
            },
            onError(error: Error) {
                wrappedMethods.onError = noop;
                onError(error);
            },
        };

        return new Track({
            title: getInfo(url).read().title,
            url,
            ...wrappedMethods,
        });
    }
}

/**
 * This is the data required to create a Track object
 */
export interface TrackData {
    url: string;
    title: string;
    onStart: () => void;
    onFinish: () => void;
    onError: (error: Error) => void;
}

const noop = () => {
};