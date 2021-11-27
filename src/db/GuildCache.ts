import { Client, Guild, GuildChannel } from "discord.js";
import MusicService from "../services/MusicService";
import { ApiHelper } from "../helpers/ApiHelper";
import AfterEvery from "after-every";

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

    public async nick(name: string) {
        await this.guild.me!.setNickname(name).catch(() => {
        });
    }

    public async unNick() {
        await this.guild.me!.setNickname(null);
    }

    /**
     * Check every 5 minutes for members in the voice channel.
     * If there are none, disconnect the bot.
     * @param {string} channelId
     * @returns {Promise<void>}
     */
    public async affirmConnectionMinutely(channelId: string) {
        const interval = 2;
        let sessionMinutes: 0;

        const timer = AfterEvery(interval).minutes(async () => {
            const channel = this.guild.channels.cache.get(this.guild.me!.voice.channelId!) as GuildChannel;

            if (channel.isVoice()) {
                sessionMinutes += interval;
                console.log(`Performed check on voice connection.`);

                if (channel.members.size === 1 && channel.members.get(this.bot.user!.id)) {
                    await this.unNick();
                    await this.guild.me!.voice.disconnect();
                    this.service!.destroy();
                    sessionMinutes = 0;
                    console.log(`Disconnected from the voice channel. Session time: ${sessionMinutes} minutes`);
                    timer();
                }

            }
        });
    }
}
