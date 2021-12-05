import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	builder: new SlashCommandBuilder()
		.setName("playlist-create")
		.setDescription("Create an empty playlist with a specified name.")
		.addStringOption(option => option
			.setName("name")
			.setDescription("The name of the playlist.")
			.setRequired(true)),

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const playlistName = helper.getInteractionString("name")!;

		try {
			await helper.cache.createUserPlaylist(member.id, playlistName);
		}
		catch (error) {
			return await helper.respond(new MessageEmbed()
				.setAuthor(`❌  ${error}`)
				.setColor("RED"));
		}

		await helper.respond(new MessageEmbed()
			.setAuthor(`✔️  Created new playlist!`)
			.setDescription(`Playlist Name: ${playlistName}`)
			.setColor("GREEN"));
	},

} as SlashCommandFile;
