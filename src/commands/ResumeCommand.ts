import {Command} from "./Command";
import {ResumeReceiver} from "../receivers/ResumeReceiver";
import {AudioService} from "../services/AudioService";
import {Message} from "discord.js";

export default class ResumeCommand extends Command {
    private readonly service: AudioService
    private readonly receiver: ResumeReceiver;

    public constructor(message: Message, service: AudioService) {
        super(message);
        this.service = service;
        this.receiver = new ResumeReceiver();
    }

    public async execute(): Promise<void> {
        await this.receiver.resume(this.message, this.service);
    }
}