import {Command} from "./Command";
import {MessagingService} from "../services/MessagingService";
import {sendMessage} from "../services-old/messaging";
import {Client, Message} from "discord.js";
import {PingReceiver} from "../receivers/PingReceiver";

export class PingCommand implements Command {
    private readonly receiver: PingReceiver;
    private readonly service: MessagingService;
    private readonly message: Message;
    private readonly bot: Client;

    public constructor(message: Message, bot: Client, service: MessagingService) {
        this.message = message;
        this.bot = bot;
        this.service = service;
        this.receiver = new PingReceiver();
    }

    public async execute(): Promise<void> {
        await this.receiver.sendPingStatus(this.message, this.bot);
    }
}