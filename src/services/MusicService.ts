import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    VoiceConnection,
    VoiceConnectionStatus
} from "@discordjs/voice";
import Song from "../models/Song";
import { ArrayUtils } from "../utilities/ArrayUtils";

export default class MusicService {
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public looping: boolean;
    public queue: Song[];

    public constructor(connection: VoiceConnection) {
        this.connection = connection;
        this.player = createAudioPlayer();
        this.looping = false;
        this.queue = [];

        this.setupPlayerListeners();
        this.setupConnectionListeners();
    }

    private setupPlayerListeners() {
        this.player.on(AudioPlayerStatus.Playing, async (oldState, newState) => {

        });

        this.player.on(AudioPlayerStatus.Paused, async (oldState, newState) => {

        });

        this.player.on(AudioPlayerStatus.Idle, async (oldState, newState) => {

        });
    }

    private setupConnectionListeners() {
        this.connection.on(VoiceConnectionStatus.Ready, async (oldState, newState) => {

        });

        this.connection.on(VoiceConnectionStatus.Destroyed, async (oldState, newState) => {

        });
    }

    public play(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // yes
        });
    }

    public pause(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.player.state.status !== AudioPlayerStatus.Paused) {
                reject();
            }

            this.player.pause();
            resolve();
        });
    }

    public resume(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.player.state.status !== AudioPlayerStatus.Paused) {
                reject();
            }

            this.player.unpause();
            resolve();
        });
    }

    public skip(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.queue.length === 0) {
                reject();
            }

            this.queue.shift();
        });
    }

    public shuffle(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.queue.length === 0) {
                reject();
            }

            ArrayUtils.shuffle(this.queue);
            resolve();
        });
    }

    public toggleLoop(): Promise<void> {
        return new Promise(resolve => {
            this.looping = !this.looping;
            resolve();
        })
    }

    public enqueue(song: Song) {
        this.queue.push(song);
    }

    public move(song: Song, to: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.queue.indexOf(song) === -1) {
                reject();
            }

            ArrayUtils.move(song, to, this.queue);
            resolve();
        });
    }

    public remove(song: Song): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.queue.indexOf(song) === -1) {
                reject();
            }

            ArrayUtils.remove(song, this.queue);
            resolve();
        });
    }
}
