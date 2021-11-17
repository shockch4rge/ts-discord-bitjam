import { Client, Guild } from "discord.js";
import MusicService from "../services/MusicService";
import { ApiHelper } from "../helpers/ApiHelper";

export default class GuildCache {
    public readonly bot: Client;
    public readonly guild: Guild;
    public readonly apiHelper: ApiHelper;
    public service?: MusicService;

    public constructor(bot: Client, guild: Guild) {
        this.bot = bot;
        this.guild = guild;
        this.apiHelper = new ApiHelper();
    }
}
