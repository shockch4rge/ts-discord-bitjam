import {
	GuildMember,
	Interaction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	WebhookEditMessageOptions
} from "discord.js";
import { InteractionHelper } from "./InteractionHelper";

const config = require("../../config.json");

export class PlaylistMenuBuilder<I extends Interaction> {
	private readonly helper: InteractionHelper<I>;

	public constructor(helper: InteractionHelper<I>) {
		this.helper = helper;
	}

	public forMainMenu() {
		const member = this.helper.interaction.member as GuildMember;
		const plus = this.helper.cache.bot.emojis.cache.get(config.emojis.plus);
		const minus = this.helper.cache.bot.emojis.cache.get(config.emojis.minus);
		const wastebasket = this.helper.cache.bot.emojis.cache.get(config.emojis.wastebasket);

		return {
			embeds: [new MessageEmbed()
				.setAuthor(`Playlist options for ${member.user.tag}:`, member.user.avatarURL()!)
				.setColor("#FF4C4E")
				.setDescription("This is the configuration menu for your very own custom playlists!\n" +
					"Pick an option using the buttons to get started.")
				.addField(`> ${plus}  Add to Playlist`, `Add a track URL to an existing playlist.`)
				.addField(`> ${minus}  Remove from Playlist`, "Remove a track from an existing playlist.")
				.addField("> 🛠️  Create playlist", "Create an empty playlist with a specified name.")
				.addField(`> ${wastebasket}  Delete playlist`, "Delete a playlist with a specified name.")],

			components: [new MessageActionRow()
				.addComponents([
					new MessageButton()
						.setCustomId("playlist-add")
						.setLabel("Add")
						.setStyle("PRIMARY"),
					new MessageButton()
						.setCustomId("playlist-remove")
						.setLabel("Remove")
						.setStyle("PRIMARY"),
					new MessageButton()
						.setCustomId("playlist-create")
						.setLabel("Create")
						.setStyle("SUCCESS"),
					new MessageButton()
						.setCustomId("playlist-delete")
						.setLabel("Delete")
						.setStyle("DANGER"),
				])],
		} as WebhookEditMessageOptions;
	}

	public forAddTrack() {

	}

	public forRemoveTrack() {

	}

	public forCreatePlaylist() {

	}

	public forDeletePlaylist() {

	}
}
