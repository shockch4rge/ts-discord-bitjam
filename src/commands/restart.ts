import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	builder: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Restart the current track. For when you missed that one section!"),

	guard: {
		test: async helper => {
			const member = helper.interaction.member as GuildMember;

			if (!helper.isMemberInMyVc(member)) {
				throw new Error("❌  We need to be in the same voice channel to use this command!");
			}

			if (!helper.cache.service) {
				throw new Error("❌  I am not currently in a voice channel!");
			}

			if (helper.cache.service.queue.length <= 0) {
				throw new Error("❌  There are no tracks in the queue!");
			}
		},

		fail: async (helper, error) => {
			return await helper.respond(new MessageEmbed()
				.setAuthor(`${error}`)
				.setColor("RED"));
		}
	},

	execute: async helper => {
		try {
			await helper.cache.service!.pause();
			await helper.cache.service!.play();
		}
		catch (error) {
			await helper.respond(new MessageEmbed()
				.setAuthor(`${error}`)
				.setColor("RED"))
		}
	}

} as SlashCommandFile;
