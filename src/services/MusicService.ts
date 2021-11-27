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
                this.stop().catch(() => {
                });
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

            switch (newState.status) {
                case AudioPlayerStatus.Idle:
                case AudioPlayerStatus.Buffering:
                    await this.cache.nick(`⏱️  ${this.cache.bot.user!.username} | Idle`);
                    break;

                case AudioPlayerStatus.Paused:
                case AudioPlayerStatus.AutoPaused:
                    await this.cache.nick(`⏸️  ${this.cache.bot.user!.username} | Paused`);
                    break;

                case AudioPlayerStatus.Playing:
                    await this.cache.nick(`▶️  ${this.cache.bot.user!.username} | Playing`);
                    break;
            }
        });
    }

    public async enqueue(tracks: Track | Track[]): Promise<void> {
        if (Array.isArray(tracks)) {
            this.queue.push(...tracks);
        }
        else {
            this.queue.push(tracks);
        }
    }

    public async play(): Promise<void> {
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            return;
        }

        try {
            const resource = await this.queue[0].createAudioResource();
            this.player.play(resource);
        }
        catch {
            throw new Error("There was an error creating the track.")
        }
    }

    public async skip(): Promise<void> {
        if (this.queue.length <= 0) {
            throw new Error("There are no more tracks left in the queue!");
        }

        // get the next track after we've shifted the first one out
        this.queue.shift();
        const nextTrack = this.queue.at(0);

        // if it doesn't exist, we've reached the end of the queue
        if (!nextTrack) {
            this.player.stop();
            throw new Error("Reached the end of the queue!");
        }

        try {
            const resource = await nextTrack.createAudioResource();
            this.player.play(resource);
        }
        catch {}
    }

    public async pause(): Promise<void> {
        if (this.player.state.status === AudioPlayerStatus.Paused) {
            throw new Error("The bot is still paused!");
        }

        const paused = this.player.pause();

        if (!paused) {
            throw new Error("There was an error pausing!");
        }
    }

    public async resume(): Promise<void> {
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            throw new Error("The bot is still playing!");
        }

        const resumed = this.player.unpause();

        if (!resumed) {
            throw new Error("There was an error resuming!")
        }
    }

    public async shuffle(): Promise<void> {
        if (this.queue.length <= 0) {
            throw new Error("There are no songs in the queue!");
        }

        Arrays.shuffle(this.queue);
    }

    public async remove(fromIndex: number, toIndex: number): Promise<void> {
        if (this.queue.length === 0) {
            throw new Error(`There are no tracks in the queue!`);
        }
        if (fromIndex <= 0 || fromIndex >= this.queue.length) {
            throw new Error(`Invalid from-index provided: (${fromIndex})`);
        }
        if (toIndex <= 0 || toIndex >= this.queue.length) {
            throw new Error(`Invalid to-index provided: (${toIndex})`)
        }

        Arrays.portion(fromIndex, toIndex, this.queue);
    }

    public async setLoopingState(state: LoopState): Promise<void> {
        if (this.loopingState === state) {
            throw new Error(`The looping state is already set to: (${state})!`)
        }

        this.loopingState = state;
    }

    public async moveTrack(atIndex: number, toIndex: number): Promise<void> {
        if (atIndex <= 1 || toIndex >= this.queue.length) {
            throw new Error(`Invalid index! Provided (${atIndex}) and (${toIndex})`);
        }

        Arrays.move(atIndex, toIndex, this.queue);
    }

    public async stop(): Promise<void> {
        if (this.player.state.status === AudioPlayerStatus.Idle) {
            throw new Error("The bot isn't playing any music!");
        }

        Arrays.clear(this.queue);
        const stopped = this.player.stop(true);

        if (!stopped) {
            throw new Error("There was an error stopping the player.");
        }
    }

    /**
     * CACHE IS ONLY USED HERE TO DELETE THE SERVICE.
     * DO NOT USE CACHE FOR ANYTHING ELSE
     * @private
     */
    public destroy() {
        delete this.cache.service;
    }

}

export enum LoopState {
    OFF = "off",
    TRACK = "track",
    QUEUE = "queue",
}
