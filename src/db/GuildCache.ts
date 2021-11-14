import { Client, Guild } from "discord.js";
import MusicService from "../services/MusicService";

export default class GuildCache {
    public readonly bot: Client;
    public readonly guild: Guild;
    public service?: MusicService;

    public constructor(bot: Client, guild: Guild) {
        this.bot = bot;
        this.guild = guild;
    }
}
