import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { PlaylistMenuBuilder } from "../utilities/PlaylistMenuBuilder";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	builder: new SlashCommandBuilder()
		.setName("playlist-play")
		.setDescription("Play the tracks from one of your own playlists."),

	guard: {
		test: async helper => {
			const member = helper.interaction.member as GuildMember;

			if (!member.voice.channel) {
				throw new Error("❌  You must be in a voice channel first!");
			}
		},

		fail: async (helper, error) => {
			return await helper.respond(new MessageEmbed()
				.setAuthor(`${error}`)
				.setColor("RED"));
		},
	},

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const playlistNames = (await helper.cache.getUserPlaylistRefs(member.id).get())
			.docs.map(doc => doc.id);
		const builder = new PlaylistMenuBuilder(helper);
		const test = builder.forPlaylistSelect(playlistNames, "playlist-play");

		console.log(test);

		await helper.respond(test);
	}

} as SlashCommandFile;
