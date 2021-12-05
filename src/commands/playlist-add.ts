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
		.setName("playlist-add")
		.setDescription("Add a URL to one of your existing playlists.")
		.addStringOption(option => option
			.setName("url")
			.setDescription("The URL of the track to append.")
			.setRequired(true)),

	execute: async helper => {
		 const member = helper.interaction.member as GuildMember;
		 const url = helper.getInteractionString("url")!;

		 const playlistNames = (await helper.cache.getUserPlaylistRefs(member.id).get())
			 .docs.map(doc => doc.id);
		 const builder = new PlaylistMenuBuilder(helper);

		 await helper.respond(builder.forPlaylistSelect(playlistNames, "playlist-add", url));
	},

} as SlashCommandFile;
