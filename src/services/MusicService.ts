import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    entersState,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus
} from "@discordjs/voice";
import Track from "../models/Track";
import { Arrays } from "../utilities/Arrays";
import GuildCache from "../db/GuildCache";
import { delay } from "../utilities/Utils";

export default class MusicService {
    private readonly cache: GuildCache
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public readonly queue: Track[];
    public loopingState: LoopState;
    private readyLock: boolean;

    public constructor(connection: VoiceConnection, cache: GuildCache) {
        this.cache = cache;
        this.connection = connection;
        this.player = createAudioPlayer();
        this.loopingState = LoopState.OFF;
        this.queue = [];
        this.readyLock = false;

        this.setupPlayerListeners();
        this.setupConnectionListeners();

        this.connection.subscribe(this.player);
    }

    private setupConnectionListeners() {
        this.connection.on('stateChange', async (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    /**
                     * If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
                     * but there is a chance the connection will recover itself if the reason of the disconnect was due to
                     * switching voice channels. This is also the same code for the bot being kicked from the voice channel,
                     * so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
                     * the voice connection.
                     */
                    try {
                        // Probably moved voice channel
                        await entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000);
                    }
                    catch {
                        // Probably removed from voice channel
                        this.connection.destroy();
                        this.destroy();
                    }
                }
                else if (this.connection.rejoinAttempts < 5) {
                    /**
                     * The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                     */
                    await delay((this.connection.rejoinAttempts + 1) * 5_000);
                    this.connection.rejoin();
                }
                else {
                    /**
                     * The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
                     */
                    this.connection.destroy();
                    this.destroy();
                }
            }
            else if (newState.status === VoiceConnectionStatus.Destroyed) {
                /**
                 * Once destroyed, stop the subscription.
                 */
                this.stop().catch(() => {});
                this.destroy();
            }
            else if (
                !this.readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
            ) {
                /**
                 * In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
                 * before destroying the voice connection. This stops the voice connection permanently existing in one of these
                 * states.
                 */
                this.readyLock = true;
                try {
                    await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
                }
                catch {
                    if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) this.connection.destroy();
                }
                finally {
                    this.readyLock = false;
                }
            }
        });

    }

    private setupPlayerListeners() {
        this.player.on("stateChange", async (oldState, newState) => {
            if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle) {
                return;
            }

            if (newState.status === AudioPlayerStatus.Idle) {
                switch (this.loopingState) {
                    case LoopState.OFF:
                        this.queue.shift();

                        if (this.queue.length !== 0) {
                            await this.play();
                        }
                        break;

                    case LoopState.TRACK:
                        // replay the current track
                        await this.play();
                        break;

                    case LoopState.QUEUE:
                        const track = this.queue.shift();

                        if (track && this.queue.length !== 0) {
                            // relocate first track to the back of the queue
                            await this.enqueue(track);
                            await this.play();
                        }
                        break;
                }
            }
        });
    }

    public enqueue(tracks: Track | Track[]): Promise<void> {
        return new Promise(resolve => {
            if (Array.isArray(tracks)) {
                this.queue.push(...tracks);
            }
            else {
                this.queue.push(tracks);
            }

            resolve();
        });

    }

    public remove(fromIndex: number, toIndex: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.queue.length === 0) {
                reject(`There are no tracks in the queue!`);
            }
            if (fromIndex < 0 || fromIndex >= this.queue.length) {
                reject(`Invalid from-index provided: (${fromIndex})`);
            }
            if (toIndex < 0 || toIndex >= this.queue.length) {
                reject(`Invalid to-index provided: (${toIndex})`)
            }

            Arrays.portion(fromIndex, toIndex, this.queue);
            resolve();
        });
    }

    public play(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.player.state.status === AudioPlayerStatus.Playing) {
                reject();
                return;
            }

            this.queue[0].createAudioResource()
                .then(resource => {
                    this.player.play(resource);
                    resolve();
                });

        });
    }

    public skip(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.queue.length <= 0) {
                return reject("There are no more tracks left in the queue!");
            }

            // get the next track after we've shifted the first one out
            this.queue.shift();
            const nextTrack = this.queue.at(0);

            // if it doesn't exist, we've reached the end of the queue
            if (!nextTrack) {
                this.player.stop();
                return reject("Reached the end of the queue!");
            }

            nextTrack.createAudioResource()
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
                reject("There are no tracks in the queue!");
            }

            Arrays.shuffle(this.queue);
            resolve();
        });
    }

    public setLoopingState(state: LoopState): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.loopingState === state) {
                reject(`The looping state is already set to: (${state})!`)
            }

            this.loopingState = state;
            resolve();
        });

    }

    public moveTrack(atIndex: number, toIndex: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (atIndex < 0 || toIndex >= this.queue.length) {
                reject(`Invalid index! Provided (${atIndex}) and (${toIndex})`);
            }

            Arrays.move(atIndex, toIndex, this.queue);
            resolve();
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.player.state.status === AudioPlayerStatus.Idle) {
                reject("The bot isn't playing any music!");
            }

            Arrays.clear(this.queue);
            const stopSuccess = this.player.stop(true);

            if (!stopSuccess) {
                reject("There was an error stopping the player.");
            }

            resolve();
        })
    }

    /**
     * CACHE IS ONLY USED HERE TO DELETE THE SERVICE.
     * DO NOT USE CACHE FOR ANYTHING ELSE
     * @private
     */
    private destroy() {
        delete this.cache.service;
    }

}

export enum LoopState {
    OFF = "off",
    TRACK = "track",
    QUEUE = "queue",
}
