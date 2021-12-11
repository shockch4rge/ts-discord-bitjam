import { MenuFile } from "../helpers/BotHelper";
import { GuildMember, MessageEmbed } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import MusicService from "../services/MusicService";
import Track from "../models/Track";

module.exports = {
	params: {
		defer: true,
		ephemeral: true,
	},

	id: "playlist-play",

	guard: {
		test: async helper => {
			const member = helper.interaction.member as GuildMember;

			if (!member.voice.channel) {
				throw new Error("❌  You must be in a voice channel first!");
			}
		},

		fail: async (helper, error) => {
			return await helper.update(new MessageEmbed()
				.setAuthor(`${error}`)
				.setColor("RED"));
		},
	},

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const name = helper.interaction.values[0];
		const playlist = await helper.cache.getUserPlaylist(member.id, name);

		if (playlist.trackUrls.length <= 0) {
			return await helper.update({
				embeds: [new MessageEmbed()
					.setAuthor(`❌  The playlist is empty!`)
					.setColor("RED")],
				components: [],
			});
		}

		if (!helper.cache.service) {
			const connection = joinVoiceChannel({
				guildId: member.guild.id,
				channelId: member.voice.channelId!,
				adapterCreator: member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
			});

			helper.cache.service = new MusicService(connection, helper.cache);
			await helper.cache.affirmConnectionMinutely(member.voice.channelId!);
		}

		const service = helper.cache.service;

		try {
			for (let i = 0; i < playlist.trackUrls.length; i++) {
				const tracks = await Track.from(playlist.trackUrls[i], helper.cache.apiHelper, member.id);
				await service.enqueue(tracks);
			}

			await service.play();
		}
		catch (error) {
			return await helper.update({
				embeds: [new MessageEmbed()
					.setAuthor(`❌  ${error}`)
					.setColor("RED")],
				components: [],
			});
		}

		await helper.update({
			embeds: [new MessageEmbed()
				.setAuthor(`✔️  Appended ${playlist.trackUrls.length} tracks from '${playlist.name}' to the queue!`)
				.setColor("GREEN")],
			components: [],
		});
	},

} as MenuFile;
