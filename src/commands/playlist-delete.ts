import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { PlaylistMenuBuilder } from "../utilities/PlaylistMenuBuilder";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	builder: new SlashCommandBuilder()
		.setName("playlist-delete")
		.setDescription("Delete one of your existing playlists!"),

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const builder = new PlaylistMenuBuilder(helper);
		const playlistNames = (await helper.cache.getUserPlaylistRefs(member.id).get())
			.docs.map(doc => doc.id);
		await helper.respond(builder.forPlaylistSelect(playlistNames, "playlist-delete"));
	}

} as SlashCommandFile;
