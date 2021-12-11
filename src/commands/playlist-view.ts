import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { TEXT } from "../utilities/Utils";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	builder: new SlashCommandBuilder()
		.setName("playlist-view")
		.setDescription("View all your playlists!"),

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const userPlaylists = await helper.cache.getUserPlaylistRefs(member.id).get();
		const playlistNames = userPlaylists.docs.map(doc => doc.id);

		const embed = new MessageEmbed();

		for (let i = 0; i < playlistNames.length; i++) {
			embed.addField(`> ${TEXT.EMOJIS.NUMBERS[i]} :   ${playlistNames[i]}`,
				`Number of tracks: ${playlistNames[i]}`);
		}

		embed
			.setAuthor(`${member.user.tag}'s Playlists:`, member.user.avatarURL()!)
			.setColor("GREYPLE");

		await helper.respond(embed);
	}

} as SlashCommandFile;
