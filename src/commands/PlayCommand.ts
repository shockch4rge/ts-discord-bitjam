import {Command} from "./Command";
import {AudioService} from "../services/AudioService";
import {PlayReceiver} from "../receivers/PlayReceiver";
import {Message} from "discord.js";

export default class PlayCommand extends Command {
    private readonly service: AudioService
    private readonly receiver: PlayReceiver;

    public constructor(message: Message, service: AudioService) {
        super(message);
        this.service = service;
        this.receiver = new PlayReceiver();
    }

    public async execute(): Promise<void> {
        await this.receiver.startPlaying(this.message, this.service);
    }
}