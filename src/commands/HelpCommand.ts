import {Command} from "./Command";
import {Message} from "discord.js";
import {HelpReceiver} from "../receivers/HelpReceiver";

export default class HelpCommand extends Command {
    private readonly receiver: HelpReceiver;

    public constructor(message: Message) {
        super(message);
        this.receiver = new HelpReceiver();
    }

    public async execute(): Promise<void> {
        await this.receiver.sendHelpInfo(this.message);
    }

}