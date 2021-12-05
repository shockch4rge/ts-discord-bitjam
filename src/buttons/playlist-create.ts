import { GuildMember } from "discord.js";
import { PlaylistMenuBuilder } from "../utilities/PlaylistMenuBuilder";
import { ButtonFile } from "../helpers/BotHelper";

module.exports = {
	id: "playlist-create",

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const builder = new PlaylistMenuBuilder(helper);

		// await helper.interaction.update(builder.forCreatePlaylist());
	},

} as ButtonFile;
