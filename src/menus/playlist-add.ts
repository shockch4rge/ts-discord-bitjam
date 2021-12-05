import { GuildMember, MessageEmbed } from "discord.js";
import { MenuFile } from "../helpers/BotHelper";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	id: "playlist-add",

	execute: async helper => {
		/**
		 * The only way to grab the URL from the user interaction is to set it as the
		 * select menu placeholder, because I can't really find a fix around passing
		 * the url from the slash command to the menu interaction. I hope discord introduces
		 * a new data type to pass into menu rows, rather than solely strings!
		 */
		const url = helper.getComponent().placeholder!;
		const member = helper.interaction.member as GuildMember;
		const playlistName = helper.interaction.values[0];

		try {
			await helper.cache.addUrlToUserPlaylist(url, playlistName, member.id);
		}
		catch (error) {
			await helper.respond(new MessageEmbed()
				.setAuthor(`❌  ${error}`)
				.setColor("RED"));
		}

		await helper.respond(new MessageEmbed()
			.setAuthor(`✔️  Added the url to ${playlistName}!`)
			.setColor("GREEN"));
	}

} as MenuFile;
