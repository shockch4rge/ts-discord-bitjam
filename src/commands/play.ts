import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import MusicService from "../services/MusicService";
import Track from "../models/Track";

module.exports = {
    params: {
        ephemeral: true,
        defer: true,
    },

    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a track with a specified search query or URL.")
        .addStringOption(option => option
            .setName("query")
            .setDescription("Can be a search query, Spotify or Youtube link.")
            .setRequired(true)
        ),

    passCondition: helper => new Promise<void>(resolve => resolve()),

    execute: async helper => {
        const member = helper.interaction.member as GuildMember;

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
        const query = helper.getInteractionString("query")!;
        let tracks: Track | Track[];

        try {
            tracks = await Track.from(query, helper.cache.apiHelper, member.id);
            await service.enqueue(tracks);
            await service.play();
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        if (Array.isArray(tracks)) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`✔️  Appended ${tracks.length} tracks to the queue!`)
                .setColor("GREEN"));
        }
        else {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`✔️  Appended '${tracks.title} - ${tracks.artist}' to the queue!`)
                .setColor("GREEN"));
        }
    },

    fail: async (helper, error) => {}
} as SlashCommandFile;
