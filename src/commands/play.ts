import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import MusicService from "../services/MusicService";
import Song from "../models/Song";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song with a specified search query or URL.")
        .addStringOption(option => option
            .setName("query")
            .setDescription("Can be a search query, Spotify or Youtube link.")
            .setRequired(true)
        ),

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
        const query = helper.getInteractionString("query")!;

        try {
            const songs = await Song.from(query, helper.cache.apiHelper, member.id);
            await service.enqueue(songs);
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                // @ts-ignore
                .setAuthor(`❌  ${e.msg ?? e}`)
                .setColor("RED"));
        }

        try {
            await service.play();
        }
        // appended to the queue instead
        catch {
            return await helper.respond(new MessageEmbed()
                .setAuthor("✔️  Appended the song(s) to the queue!")
                .setColor("GREEN"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Playing...")
            .setColor("GREEN"));
    }
} as InteractionFile;
