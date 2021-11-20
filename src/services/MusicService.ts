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
                await this.skip();
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
        });
    }

    public play(song: Song): Promise<void> {
        return new Promise((resolve, reject) => {
            this.queue.push(song);

            if (this.player.state.status !== AudioPlayerStatus.Playing) {
                this.queue[0]
                    .createAudioResource()
                    .then(resource => {
                        this.player.play(resource);
                    })
                    .catch(() => {
                        reject("Failed to create audio resource.");
                    });
            }
            else {
                reject("Appended the song to the queue!");
            }

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
