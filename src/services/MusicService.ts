import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    entersState,
    VoiceConnection,
    VoiceConnectionStatus
} from "@discordjs/voice";
import Song from "../models/Song";
import { ArrayUtils } from "../utilities/ArrayUtils";

export default class MusicService {
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public looping: LoopState;
    public queue: Song[];

    public constructor(connection: VoiceConnection) {
        this.connection = connection;
        this.player = createAudioPlayer();
        this.connection.subscribe(this.player);
        this.looping = LoopState.OFF;
        this.queue = [];

        this.setupPlayerListeners();
        this.setupConnectionListeners();
    }

    private setupPlayerListeners() {
        this.player.on(AudioPlayerStatus.Playing, async (oldState, newState) => {

        });

        this.player.on(AudioPlayerStatus.Paused, async (oldState, newState) => {

        });

        this.player.on(AudioPlayerStatus.Idle, async oldState => {
            if (oldState.status === AudioPlayerStatus.Playing) {
                switch (this.looping) {
                    case LoopState.OFF:
                        this.queue.shift();
                        break;

                    case LoopState.SONG:
                        await this.play(this.queue[0]);
                        break;

                    case LoopState.QUEUE:
                        this.enqueue(this.queue[0]);
                        this.queue.shift();
                        break;
                }
            }
        });
    }

    private setupConnectionListeners() {
        this.connection.on(VoiceConnectionStatus.Ready, async oldState => {

        });

        this.connection.on(VoiceConnectionStatus.Destroyed, async oldState => {

        });

        this.connection.on(VoiceConnectionStatus.Disconnected, async oldState => {
            try {
                this.connection.rejoin();
                await entersState(this.connection, VoiceConnectionStatus.Ready, 10000);
            }
            catch {

            }
        })
    }

    public play(song: Song): Promise<void> {
        return new Promise((resolve, reject) => {
            this.prepend(song);
            this.queue[0]
                .createAudioResource()
                .then(resource => this.player.play(resource))
                .catch(() => {
                    reject("Failed to create resource.");
                });

            resolve();
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

            ArrayUtils.shuffle(this.queue);
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

    public prepend(song: Song) {
        this.queue.unshift(song);
    }

    public enqueue(song: Song) {
        this.queue.push(song);
    }

    public moveSong(atIndex: number, toIndex: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (atIndex < 0 || toIndex >= this.queue.length) {
                reject(`Invalid index! Provided (${atIndex}) and (${toIndex})`);
            }

            ArrayUtils.move(atIndex, toIndex, this.queue);
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

            ArrayUtils.remove(song, this.queue);
            resolve();
        });
    }

    public skip(): Promise<void> {
        return new Promise((resolve, reject) => {
            // get the next song first. If it doesn't exist, we've reached the end of the queue
            const song = this.queue.at(1);

            this.queue.shift();

            if (!song) {
                this.player.stop();
                return;
            }

            try {
                this.play(song)
                    .then(resolve);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    public swap(indexOne: number, indexTwo: number) {
        return new Promise((resolve, reject) => {
            if (indexOne >= this.queue.length || indexTwo >= this.queue.length) {
                reject(`Invalid indexes! Provided (${indexOne}), (${indexTwo}).`);
            }

            ArrayUtils.swap(this.queue[indexOne], this.queue[indexTwo], this.queue);
        });
    }
}

export enum LoopState {
    OFF,
    SONG,
    QUEUE,
}
