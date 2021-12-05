import { InteractionHelper } from "../utilities/InteractionHelper";
import { ButtonInteraction, MessageEmbed, WebhookMessageOptions } from "discord.js";
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

    public edit(options: MessageEmbed | WebhookMessageOptions | string): Promise<void> {
        return Promise.resolve(undefined);
    }

    public async update(options: MessageEmbed | WebhookMessageOptions | string): Promise<void> {
        if (options instanceof MessageEmbed) {
            await this.interaction.update({
                embeds: [options],
            }).catch(() => {});
        }
        else if (typeof options === "object") {
            await this.interaction.update(options).catch(() => {});
        }
        else {
            await this.interaction.update({
                content: options,
            }).catch(() => {});
        }

    }
}
