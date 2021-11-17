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
        .addStringOption(option =>
            option
                .setName("url")
                .setRequired(true)
        ),

    execute: async helper => {
        const member = helper.interaction.member as GuildMember;

        if (!helper.isMemberInBotVc(member)) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  We must be in the same voice channel to use this command!")
                .setColor("RED"));
        }

        if (!helper.cache.service) {
            const connection = joinVoiceChannel({
                guildId: member.guild.id,
                channelId: member.voice.channelId!,
                adapterCreator: member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });

            helper.cache.service = new MusicService(connection);
        }

        const service = helper.cache.service;
        const url = helper.getInteractionString("url")!;

        const song = await Song.from(url, helper.cache.apiHelper, member.displayName);

        try {
            await service.play(song);
        }
        catch {

        }
    }

} as InteractionFile;
