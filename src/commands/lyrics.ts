import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("Find a track's lyrics by title. Leave field empty for the current track.")
        .addStringOption(option => option
            .setName("title")
            .setDescription("Any track title. Include the artist for more accurate results.")
            .setRequired(false)),

    execute: async helper => {
        const member = helper.interaction.member as GuildMember;

        if (!helper.isMemberInBotVc(member)) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  We must be in the same voice channel to use this command!")
                .setColor("RED"));
        }

        const service = helper.cache.service;

        if (!service) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  I am not currently in a voice channel!")
                .setColor("RED"));
        }

        if (service.queue.length <= 0) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  There are no tracks in the queue!")
                .setColor("RED"));
        }

        // may be null
        let title = helper.getInteractionString("title");
        let lyrics: string;

        if (!title) {
            const track = service.queue[0];
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
    }
} as InteractionFile;
