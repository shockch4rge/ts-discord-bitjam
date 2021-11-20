import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Move a song at an index to another one.")
        .addIntegerOption(option =>
            option
                .setName("from-index")
                .setDescription("The index of the song to move. (min = 0)")
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName("to-index")
                .setDescription("Move the song to this index. (max = queue length - 1)")
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

        const fromIndex = helper.getInteractionInteger("from-index")!;
        const toIndex = helper.getInteractionInteger("to-index")!;

        try {
            await service.moveSong(fromIndex, toIndex);
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${e}`)
                .setColor("RED"));
        }
    }
} as InteractionFile;
