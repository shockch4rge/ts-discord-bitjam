import {Command} from "./Command";
import {MessagingService} from "../services/MessagingService";
import {Message} from "discord.js";
import {HelpReceiver} from "../receivers/HelpReceiver";

export class HelpCommand implements Command {
    private readonly service: MessagingService;
    private readonly message: Message;
    private readonly receiver: HelpReceiver;

    public constructor(message: Message, service: MessagingService) {
        this.message = message;
        this.service = service;
        this.receiver = new HelpReceiver();
    }

    public async execute(): Promise<void> {
        await this.receiver.sendHelpInfo(this.message, this.service);
    }

}