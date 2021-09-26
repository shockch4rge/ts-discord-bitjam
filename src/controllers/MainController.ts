import {AudioService} from "../services/AudioService";
import {Client, Message} from "discord.js";
import PlayCommand from "../commands/PlayCommand";
import PingCommand from "../commands/PingCommand";
import HelpCommand from "../commands/HelpCommand";
import PauseCommand from "../commands/PauseCommand";
import ResumeCommand from "../commands/ResumeCommand";
import {joinVoiceChannel} from "@discordjs/voice";

export const COMMAND =
    {
        PING: /^>>ping/,
        HELP: /^>>help/,
        PLAY: /^>>play\s(https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$)/i,
        PAUSE: /^>>pause/,
        RESUME: /^>>resume/,
        SEARCH: /^>>search/,
    } as const

export class MainController {
    private readonly bot: Client;

    public constructor(bot: Client) {
        this.bot = bot;
    }

    public subscribeBotEvents() {
        this.bot.on("ready", this.handleBotReady);
        this.bot.on("messageCreate", this.handleMessageCreate);
    }

    public handleBotReady(bot: Client) {
        console.log("BitJam is ready!")
        bot.user!.setPresence({
            activities: [{type: 'LISTENING', name: ">>help"}],
            status: "online"
        });
    }

    public async handleMessageCreate(message: Message) {
        if (message.author.bot || !message.channel || !message.guild) return;

        if (message.content.match(COMMAND.PING)) {
            const pingCommand = new PingCommand(message, this.bot);
            return await pingCommand.execute();
        }

        if (message.content.match(COMMAND.HELP)) {
            const helpCommand = new HelpCommand(message);
            return await helpCommand.execute();
        }

        if (message.content.match(COMMAND.PLAY)) {
            const audioService = new AudioService(joinVoiceChannel({
                guildId: message.guildId!,
                channelId: message.channelId!,
                adapterCreator: message.guild!.voiceAdapterCreator
            }));
            const playCommand = new PlayCommand(message, audioService);
            return await playCommand.execute();
        }

        if (message.content.match(COMMAND.PAUSE)) {
            const audioService = new AudioService(joinVoiceChannel({
                guildId: message.guildId!,
                channelId: message.channelId!,
                adapterCreator: message.guild!.voiceAdapterCreator
            }));
            const pauseCommand = new PauseCommand(message, audioService);
            return await pauseCommand.execute();
        }

        if (message.content.match(COMMAND.RESUME)) {
            const audioService = new AudioService(joinVoiceChannel({
                guildId: message.guildId!,
                channelId: message.channelId!,
                adapterCreator: message.guild!.voiceAdapterCreator
            }));
            const resumeCommand = new ResumeCommand(message, audioService);
            return await resumeCommand.execute();
        }
    }
}