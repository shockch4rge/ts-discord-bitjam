import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer, joinVoiceChannel,
    PlayerSubscription,
    VoiceConnection,
    VoiceConnectionStatus
} from "@discordjs/voice";
import Track from "./Track";
import {Message} from "discord.js";
import {Service} from "./Service";

export class AudioService implements Service {
    private readonly player: AudioPlayer;
    private readonly connection: VoiceConnection;
    private subscription: PlayerSubscription;
    public queue: Track[];
    public isLooping: boolean;

    public constructor(connection: VoiceConnection) {
        this.connection = connection;
        this.player = createAudioPlayer();
        this.queue = [];
        this.isLooping = false;

        // pass in the member instead of using it directly for conciseness
        this.initAudioPlayerListeners(this.player);
        this.initVoiceConnectionListeners(this.connection);

        this.subscription = this.connection.subscribe(this.player)!;
    }

    public suspendService(): Promise<void> {
        return new Promise(resolve => {
            this.clearQueue();
            this.isLooping = false;
            this.player.stop(true);
            this.connection.disconnect();
            this.subscription.unsubscribe();
            resolve();
        });
    }

    public resumeService(): Promise<void> {
        return new Promise(resolve => {
            this.connection.rejoin();
            this.subscription = this.connection.subscribe(this.player)!;
            resolve();
        });
    }

    public initAudioPlayerListeners(player: AudioPlayer) {
        // Playing
        player.on(AudioPlayerStatus.Playing, async (_, newState) => {

        });

        // AutoPaused | Paused
        player.on(AudioPlayerStatus.AutoPaused || AudioPlayerStatus.AutoPaused, async (_, newState) => {

        });

        // Idle
        player.on(AudioPlayerStatus.Idle, async (_, newState) => {

        });
    }

    public initVoiceConnectionListeners(connection: VoiceConnection) {
        // Ready
        connection.on(VoiceConnectionStatus.Ready, async (_, newState) => {

        });

        // Disconnected
        connection.on(VoiceConnectionStatus.Disconnected, async (_, newState) => {

        });

        // Destroyed
        connection.on(VoiceConnectionStatus.Destroyed, async (_, newState) => {

        });
    }

    public async play() {
        this.player.play(await this.queue[0].create());
    }

    public pause(): boolean {
        if (this.player.state.status !== AudioPlayerStatus.AutoPaused && this.player.state.status !== AudioPlayerStatus.Paused) {
            return this.player.pause();
        }
        return false;
    }

    public resume(): boolean {
        if (this.player.state.status !== AudioPlayerStatus.Playing) {
            return this.player.unpause();
        }
        return false;
    }

    // public skip() {
    //     void this.queue.shift();
    //     this.player.play(this.queue[0].create());
    // }

    public enqueue(track: Track) {
        void this.queue.push(track);
    }

    public clearQueue() {
        void this.queue.splice(0, this.queue.length);
    }

    public toggleLoop() {
        this.isLooping = !this.isLooping;
    }

    public joinVc(message: Message) {
        return joinVoiceChannel({
            guildId: message.guildId!,
            channelId: message.channelId!,
            adapterCreator: message.guild!.voiceAdapterCreator
        });
    }
}

