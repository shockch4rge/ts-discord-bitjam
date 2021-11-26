import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("move-track")
        .setDescription("Move a track at an index to another one.")
        .addIntegerOption(option => option
            .setName("at-index")
            .setDescription("The index of the track to move. (min = 1)")
            .setRequired(true))
        .addIntegerOption(option => option
            .setName("to-index")
            .setDescription("Move the track to this index. (max = queue length - 1)")
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

        const atIndex = helper.getInteractionInteger("at-index")! - 1;
        const toIndex = helper.getInteractionInteger("to-index")! - 1;

        try {
            await service.moveTrack(atIndex, toIndex);
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${e}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Moved track at index (${atIndex}) to (${toIndex})`)
            .setColor("GREEN"));
    }
} as InteractionFile;
