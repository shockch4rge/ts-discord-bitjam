import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("Get the song's lyrics at a specified queue index. Leave option empty for the current song.")
        .addIntegerOption(option => option
            .setName("index")
            .setDescription("The song's index to fetch the lyrics of. Leave empty for the current song.")
            .setRequired(false)),

    execute: async helper => {
        const member = helper.interaction.member as GuildMember;

        if (!helper.isMemberInBotVc(member)) {
            return await helper.respond(new MessageEmbed()
                .setTitle("❌  We must be in the same voice channel to use this command!")
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
                .setAuthor("❌  There are no songs in the queue!")
                .setColor("RED"));
        }

        // may be null
        let index = helper.getInteractionInteger("index");

        // user wants the current song
        if (!index) {
            index = 1;
        }

        if (index <= 0 || index > service.queue.length) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  Invalid index provided: (${index})`)
                .setColor("RED"));
        }

        const song = service.queue[index - 1];
        let lyrics: string;

        try {
            lyrics = await helper.cache.apiHelper.getGeniusLyrics(`${song.title} ${song.artist}`);
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${e}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`🎤  Lyrics for ${song.title}:`)
            .setDescription(lyrics)
            .setColor("GREYPLE"));
    }
} as InteractionFile;
