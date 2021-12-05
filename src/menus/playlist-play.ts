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

	execute: async helper => {
		const member = helper.interaction.member as GuildMember;
		const name = helper.interaction.values[0];
		console.log(name);
		const playlist = await helper.cache.getUserPlaylist(member.id, name);

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
				const track = (await Track.from(playlist.trackUrls[i], helper.cache.apiHelper, member.id)) as Track;
				await service.enqueue(track);
			}
			await service.play();
		}
		catch (error) {
			return await helper.respond(new MessageEmbed()
				.setAuthor(`❌  ${error}`)
				.setColor("RED"));
		}

		await helper.respond(new MessageEmbed()
			.setAuthor(`✔️  Appended ${playlist.trackUrls.length} tracks from ${playlist.name} to the queue!`)
			.setColor("GREEN"));
	},

} as MenuFile;
