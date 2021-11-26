// This command is for testing audio connections.
// Plays a 10-second audio clip from Youtube.
import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import Track from "../models/Track";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import MusicService from "../services/MusicService";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("test-audio")
        .setDescription("Play a 10-second clip from Youtube to test the audio connection."),

    execute: async helper => {
        const member = helper.interaction.member as GuildMember;

        if (!helper.cache.service) {
            const connection = joinVoiceChannel({
                guildId: member.guild.id,
                channelId: member.voice.channelId!,
                adapterCreator: member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });

            helper.cache.service = new MusicService(connection, helper.cache);
        }

        const service = helper.cache.service;
        const url = "https://www.youtube.com/watch?v=wN9bXy_fiOE"

        try {
            const track = await Track.from(url, helper.cache.apiHelper, member.id);
            await service.enqueue(track);
            await service.play();
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${e}`)
                .setColor("RED"));
        }

        await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Playing...")
            .setColor("GREEN"));
    }

} as InteractionFile;
