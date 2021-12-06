import { InteractionHelper } from "../utilities/InteractionHelper";
import {
	MessageEmbed,
	MessageSelectMenu,
	SelectMenuInteraction,
	WebhookEditMessageOptions,
	WebhookMessageOptions
} from "discord.js";
import GuildCache from "../db/GuildCache";

export class SelectMenuHelper extends InteractionHelper<SelectMenuInteraction> {
	public constructor(cache: GuildCache, interaction: SelectMenuInteraction) {
		super(cache, interaction);
	}

	public async respond(options: MessageEmbed | WebhookEditMessageOptions | string) {
		if (options instanceof MessageEmbed) {
			await this.interaction.followUp({
				embeds: [options],
			}).catch(() => {});
		}
		else if (typeof options === "object") {
			await this.interaction.editReply(options).catch(() => {});
		}
		else {
			await this.interaction.followUp({
				content: options,
			}).catch(() => {});
		}

	}

	public getComponent() {
		return this.interaction.component as MessageSelectMenu;
	}

	public async edit(options: MessageEmbed | WebhookMessageOptions | string): Promise<void> {
		return Promise.resolve(undefined);
	}

	public async update(options: MessageEmbed | WebhookEditMessageOptions | string): Promise<void> {
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
