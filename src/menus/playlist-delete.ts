import { MenuFile } from "../helpers/BotHelper";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	id: "playlist-delete",

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const playlistName = helper.interaction.values[0];

		try {
			await helper.cache.deleteUserPlaylist(member.id, playlistName);
		}
		catch (error) {
			await helper.update({
				embeds: [new MessageEmbed()
					.setAuthor(`❌  ${error}`)
					.setColor("RED")],
				components: [],
			});
		}

		await helper.update({
			embeds: [new MessageEmbed()
				.setAuthor(`✔️  Deleted ${playlistName} from your playlists!`)
				.setColor("GREEN")],
			components: [],
		})
	}

} as MenuFile;
