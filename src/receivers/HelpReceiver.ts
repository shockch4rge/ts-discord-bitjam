import {Message} from "discord.js";
import {MessagingService} from "../services/MessagingService";
import {Receiver} from "./Receiver";

export class HelpReceiver implements Receiver {
    public readonly callables: Function[];

    public constructor() {
        this.callables = [
            this.sendHelpInfo,
        ];
    }

    public async sendHelpInfo(message: Message, service: MessagingService) {
        await service.send(message, {
            author: "Commands",
            fields: [
                { name: "`>>search <query>`", value: "Plays an MP3 file or a YouTube link.", inline: true },
                { name: "`>>play <url>`", value: "Searches for a song on Youtube.", inline: true },
                { name: "`>>pause`", value: "Pauses the player.", inline: true },
                { name: "`>>resume`", value: "Resumes the player.", inline: true },
                { name: "`>>skip`", value: "Skips to the next song in the queue, if there is one.", inline: true },
                { name: "`>>queue`", value: "Displays the current queue.", inline: true },
                { name: "`>>hi`", value: "Connects the player to the voice channel.", inline: true },
                { name: "`>>bye`", value: "Disconnects the player from the voice channel.", inline: true },
                { name: "`>>ping`", value: "Check the response time of the bot, in milliseconds.", inline: true },
                { name: "`>>channel`", value: "Create a dedicated channel for search queries.", inline: true },
                { name: "`>>seek`", value: "Seek to a duration in the currently playing track.", inline: true },
                { name: "`>>loop`", value: "Toggle looping of the player.", inline: true },
            ],
            footer: "❗ All commands listed here except for '>>ping' require you to be in a voice channel."
        });
    }
}