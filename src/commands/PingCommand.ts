import {Command} from "./Command";
import {Client, Message} from "discord.js";
import {PingReceiver} from "../receivers/PingReceiver";

export default class PingCommand extends Command {
    private readonly bot: Client
    private readonly receiver: PingReceiver;

    public constructor(message: Message, bot: Client) {
        super(message);
        this.bot = bot;
        this.receiver = new PingReceiver();
    }

    public async execute(): Promise<void> {
        await this.receiver.sendPingStatus(this.message, this.bot);
    }
}