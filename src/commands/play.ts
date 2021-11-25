import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import MusicService from "../services/MusicService";
import Song from "../models/Song";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song with a given url.")
        .addStringOption(option => option
            .setName("url")
            .setDescription("The song's URL. Can be a Spotify or Youtube link.")
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
        const url = helper.getInteractionString("url")!;

        try {
            const songs = await Song.from(url, helper.cache.apiHelper, member.id);
            await service.enqueue(songs)
            await service.play();
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
            // @ts-ignore
                .setAuthor(`❌  ${e.msg ?? e}`)
                .setColor("RED"));
        }

        await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Playing...")
            .setColor("GREEN"));
    }
} as InteractionFile;
