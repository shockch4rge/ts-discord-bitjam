import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PlaylistMenuBuilder } from "../utilities/PlaylistMenuBuilder";


module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	builder: new SlashCommandBuilder()
		.setName("playlist-menu")
		.setDescription("Customise your playlists here!"),

	execute: async helper => {
		const builder = new PlaylistMenuBuilder(helper);
		await helper.interaction.editReply(builder.forMainMenu());
	},

} as SlashCommandFile;
