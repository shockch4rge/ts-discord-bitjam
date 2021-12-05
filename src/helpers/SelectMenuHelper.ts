import { InteractionHelper } from "../utilities/InteractionHelper";
import { MessageEmbed, SelectMenuInteraction } from "discord.js";
import GuildCache from "../db/GuildCache";

export class SelectMenuHelper extends InteractionHelper<SelectMenuInteraction> {
	public constructor(cache: GuildCache, interaction: SelectMenuInteraction) {
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
