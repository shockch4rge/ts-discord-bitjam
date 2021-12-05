import { ButtonFile } from "../helpers/BotHelper";
import { GuildMember } from "discord.js";
import { PlaylistMenuBuilder } from "../utilities/PlaylistMenuBuilder";

module.exports = {
	id: "playlist-add",

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const builder = new PlaylistMenuBuilder(helper);

		// await helper.interaction.update(builder.forAddTrack());
	},

} as ButtonFile;
