import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import Song from "../models/Song";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("prepend")
        .setDescription("Prepends a song to the beginning of the queue.")
        .addStringOption(option =>
            option
                .setName("url")
                .setDescription("The URL of the song. Can be a Spotify or Youtube link.")
                .setRequired(true)),

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

        const url = helper.getInteractionString("url")!;

        const song = await Song.from(url, helper.cache.apiHelper, member.displayName);

        service.prepend(song);
    }

} as InteractionFile;
