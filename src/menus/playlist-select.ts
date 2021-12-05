import { MenuFile } from "../helpers/BotHelper";
import { MessageEmbed } from "discord.js";


module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	id: "playlist-select",

	execute: async helper => {
		const name = helper.interaction.values[0];

		try {
		}
		catch ({ message }) {
			await helper.respond(new MessageEmbed()
				.setAuthor(`❌  ${message}`)
				.setColor("RED"));
		}
	}

} as MenuFile;
