import {Command} from "./Command";
import {AudioService} from "../services/AudioService";
import {PauseReceiver} from "../receivers/PauseReceiver";
import {Message} from "discord.js";

export default class PauseCommand extends Command {
    private readonly service: AudioService;
    private readonly receiver: PauseReceiver;

    public constructor(message: Message, service: AudioService) {
        super(message);
        this.service = service;
        this.receiver = new PauseReceiver();
    }

    public async execute(): Promise<void> {
        await this.receiver.pause(this.message, this.service);
    }
}