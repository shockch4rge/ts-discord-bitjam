import GuildCache from "../db/GuildCache";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { InteractionHelper } from "../utilities/InteractionHelper";

export default class CommandInteractionHelper extends InteractionHelper<CommandInteraction> {
    public constructor(cache: GuildCache, interaction: CommandInteraction) {
        super(cache, interaction);
    }

    public async respond(options: MessageEmbed | string) {
        if (options instanceof MessageEmbed) {
            await this.interaction.followUp({
                embeds: [options],
                ephemeral: true,
            }).catch(() => {});
        }
        else {
            await this.interaction.followUp({
                content: options,
                ephemeral: true,
            }).catch(() => {});
        }

    }

    public isMemberInBotVc(member: GuildMember) {
        const channel = member.voice.channel;

        return channel && (channel.id === this.cache.guild.me?.voice.channelId);
    }

    public getInteractionMentionable(name: string) {
        return this.interaction.options.getMentionable(name);
    }

    public getInteractionChannel(name: string) {
        return this.interaction.options.getChannel(name);
    }

    public getInteractionRole(name: string) {
        return this.interaction.options.getRole(name);
    }

    public getInteractionUser(name: string) {
        return this.interaction.options.getUser(name);
    }

    public getInteractionString(name: string) {
        return this.interaction.options.getString(name);
    }

    public getInteractionInteger(name: string) {
        return this.interaction.options.getInteger(name);
    }

    public getInteractionBoolean(name: string) {
        return this.interaction.options.getBoolean(name);
    }
}
