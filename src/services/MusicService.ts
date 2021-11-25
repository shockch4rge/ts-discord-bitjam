import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    entersState,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus
} from "@discordjs/voice";
import Song from "../models/Song";
import { Arrays } from "../utilities/Arrays";
import GuildCache from "../db/GuildCache";

export default class MusicService {
    private readonly cache: GuildCache
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public looping: LoopState;
    public queue: Song[];

    public constructor(connection: VoiceConnection, cache: GuildCache) {
        this.cache = cache;
        this.connection = connection;
        this.player = createAudioPlayer();
        this.connection.subscribe(this.player);
        this.looping = LoopState.OFF;
        this.queue = [];

        this.setupPlayerListeners();
        this.setupConnectionListeners();
    }

    private setupConnectionListeners() {
        this.connection.on(VoiceConnectionStatus.Ready, async oldState => {

        });

        this.connection.on(VoiceConnectionStatus.Destroyed, async oldState => {

        });

        this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
                newState.closeCode === 4014) {
                return;
            }

            try {
                await entersState(this.connection, VoiceConnectionStatus.Connecting, 10000);
            }
            catch {

            }
        });
    }

    private setupPlayerListeners() {
        this.player.on(AudioPlayerStatus.Playing, async (oldState, newState) => {

        });

        this.player.on(AudioPlayerStatus.Paused, async (oldState, newState) => {

        });

        this.player.on(AudioPlayerStatus.Idle, async oldState => {
            if (oldState.status === AudioPlayerStatus.Idle) return;

            switch (this.looping) {
                case LoopState.OFF:
                    this.queue.shift();

                    if (this.queue.length !== 0) {
                        await this.play();
                    }
                    break;

                case LoopState.SONG:
                    // replay the current song
                    await this.play();
                    break;

                case LoopState.QUEUE:
                    const song = this.queue.shift();

                    if (song && this.queue.length !== 0) {
                        // relocate first song to the back of the queue
                        await this.enqueue(song);
                        await this.play();
                    }
                    break;
            }
        });
    }

    public enqueue(songs: Song | Song[]): Promise<void> {
        return new Promise(resolve => {
            if (Array.isArray(songs)) {
                this.queue.push(...songs);
            }
            else {
                this.queue.push(songs);
            }

            resolve();
        })

    }

    public dequeue(fromIndex: number, toIndex: number) {
        for (let i = fromIndex; i <= toIndex; i++) {
            Arrays.remove(this.queue[i], this.queue);
        }
    }

    /**
     * Plays the first song in the queue.
     * @returns {Promise<void>}
     */
    public play(): Promise<void> {
        return new Promise((resolve, reject) => {

            if (this.player.state.status === AudioPlayerStatus.Playing) {
                reject("Appended the song to the queue!");
                return;
            }

            this.queue[0].createAudioResource()
                .then(resource => {
                    this.player.play(resource);
                    resolve();
                })
                .catch(() => {
                    reject("Failed to create audio resource.");
                });

        });
    }

    public pause(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.player.state.status !== AudioPlayerStatus.Paused) {
                reject("The bot is still paused!");
            }

            this.player.pause();
            resolve();
        });
    }

    public resume(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.player.state.status !== AudioPlayerStatus.Paused) {
                reject("The bot is still playing!");
            }

            this.player.unpause();
            resolve();
        });
    }

    public shuffle(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.queue.length <= 0) {
                reject("There are no songs in the queue.");
            }

            Arrays.shuffle(this.queue);
            resolve();
        });
    }

    public toggleLoop() {
        switch (this.looping) {
            case LoopState.OFF:
                this.looping = LoopState.SONG;
                break;

            case LoopState.SONG:
                this.looping = LoopState.QUEUE;
                break;

            case LoopState.QUEUE:
                this.looping = LoopState.OFF;
                break;
        }
    }

    public moveSong(atIndex: number, toIndex: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (atIndex < 0 || toIndex >= this.queue.length) {
                reject(`Invalid index! Provided (${atIndex}) and (${toIndex})`);
            }

            Arrays.move(atIndex, toIndex, this.queue);
            resolve();
        });
    }

    public remove(index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (index === this.queue.length || index < 0) {
                reject(`Invalid index! Provided (${index}).`);
            }

            const song = this.queue.at(index);

            if (!song) {
                reject(`Song not found at index (${index}).`);
            }

            Arrays.remove(song, this.queue);
            resolve();
        });
    }

    public skip(): Promise<void> {
        return new Promise((resolve, reject) => {
            // get the next song first. If it doesn't exist, we've reached the end of the queue
            if (!this.queue.at(1)) {
                this.player.stop();
                reject("Reached the end of the queue!");
            }

            this.queue.shift();

            this.queue[0].createAudioResource()
                .then(resource => {
                    this.player.play(resource);
                    resolve();
                })
                .catch(reject);
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.player.state.status === AudioPlayerStatus.Idle) {
                reject("The bot isn't playing any music!");
            }

            Arrays.clear(this.queue);
            const stopSuccess = this.player.stop();

            if (!stopSuccess) {
                reject("There was an error stopping the player.");
            }

            resolve();
        })
    }

}

export enum LoopState {
    OFF,
    SONG,
    QUEUE,
}
