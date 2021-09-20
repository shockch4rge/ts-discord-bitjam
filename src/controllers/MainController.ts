import {BotService} from "../services/BotService";
import {AudioService} from "../services/AudioService";
import {MessagingService} from "../services/MessagingService";
import {Client, Message} from "discord.js";
import {Command} from "../commands/Command";
import {PlayCommand} from "../commands/PlayCommand";
import {PingCommand} from "../commands/PingCommand";
import {HelpCommand} from "../commands/HelpCommand";

export const COMMAND = {
    PING: /^>>ping/,
    HELP: /^>>help/,
    PLAY: /^>>play\s(https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$)/i,
    PAUSE: /^>>pause/,
    RESUME: /^>>resume/,
    SEARCH: /^>>search/,
} as const

export class MainController {
    private readonly bot: Client;
    private readonly botService: BotService;
    private readonly audioService: AudioService;
    private readonly messagingService: MessagingService;

    public constructor(bot: Client, botService: BotService, audioService: AudioService, messagingService: MessagingService) {
        this.bot = bot;
        this.botService = botService;
        this.audioService = audioService;
        this.messagingService = messagingService;
    }

    public subscribeBotEvents() {
        this.bot.on("ready", this.handleBotReady);
        this.bot.on("messageCreate", this.handleMessageCreate);
    }

    public handleBotReady() {
        console.log("BitJam is ready!")
        this.bot.user!.setPresence({
            activities: [{type: 'LISTENING', name: ">>help"}],
            status: "online"
        });
    }

    public async handleMessageCreate(message: Message) {
        if (message.author.bot || !message.guild || !message.channel) return;

        if (message.content.match(COMMAND.PING)) {
            const pingCommand = new PingCommand(message, this.bot, this.messagingService);
            if (this.isCommand(pingCommand)) {
                return await pingCommand.execute();
            }
        }

        if (message.content.match(COMMAND.HELP)) {
            const helpCommand = new HelpCommand(message, this.messagingService);
            if (this.isCommand(helpCommand)) {
                return await helpCommand.execute();
            }
        }

        if (message.content.match(COMMAND.PLAY)) {
            const playCommand = new PlayCommand(this.audioService);
            if (this.isCommand(playCommand)) {
                return await playCommand.execute();
            }
        }
    }

    public isCommand(command: any): command is Command {
        return command.execute !== undefined;
    }
}