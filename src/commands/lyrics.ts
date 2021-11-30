import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
	params: {
		ephemeral: true,
		defer: true,
	},

	data: new SlashCommandBuilder()
		.setName("lyrics")
		.setDescription("Find a track's lyrics by title. Leave field empty for the current track.")
		.addStringOption(option => option
			.setName("title")
			.setDescription("Any track title. Include the artist for more accurate results.")
			.setRequired(false)),

	passCondition: helper => {
		return new Promise<void>((resolve, reject) => {
			const member = helper.interaction.member as GuildMember;

			if (!helper.isMemberInMyVc(member)) {
				reject("❌  We need to be in the same voice channel to use this command!");
			}

			if (!helper.cache.service) {
				reject("❌  I am not currently in a voice channel!");
			}

			resolve();
		});

	},

	execute: async helper => {
		// may be null
		let title = helper.getInteractionString("title");
		let lyrics: string;

		if (!title) {
			const track = helper.cache.service!.queue[0];
			title = `${track.title} - ${track.artist}`;
			lyrics = await helper.cache.apiHelper.getGeniusLyrics(title);
		}
		else {
			lyrics = await helper.cache.apiHelper.getGeniusLyrics(title);
		}

		return await helper.respond(new MessageEmbed()
			.setAuthor(`🎤  Lyrics for ${title}:`)
			.setDescription(lyrics)
			.setColor("GREYPLE"));
	},

	fail: async (helper, error) => {
		return await helper.respond(new MessageEmbed()
			.setAuthor(`${error}`)
			.setColor("RED"));
	}
} as SlashCommandFile;
