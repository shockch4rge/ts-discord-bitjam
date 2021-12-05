import { InteractionHelper } from "../utilities/InteractionHelper";
import { ButtonInteraction, MessageEmbed } from "discord.js";
import GuildCache from "../db/GuildCache";

export class ButtonHelper extends InteractionHelper<ButtonInteraction> {
    public constructor(cache: GuildCache, interaction: ButtonInteraction) {
        super(cache, interaction);
    }

    public async respond(options: MessageEmbed | string) {
        if (options instanceof MessageEmbed) {
            await this.interaction.followUp({
                embeds: [options],
            }).catch(() => {});
        }
        else {
            await this.interaction.followUp({
                content: options,
            }).catch(() => {});
        }

    }
}
