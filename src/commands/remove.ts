import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove a single song, or a range of songs from specified indexes.")
        .addIntegerOption(option => option
            .setName("from-index")
            .setDescription("The starting index to remove songs from. Leave only this option filled to remove 1 song. (min: 1)")
            .setRequired(true))
        .addIntegerOption(option => option
            .setName("to-index")
            .setDescription("The range bound to remove songs in. Leave this empty to remove 1 song. (max: queue length - 1)")
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

        const fromIndex = helper.getInteractionInteger("from-index")! - 1;
        const toIndex = helper.getInteractionInteger("to-index") ?? 0;

        try {
            await service.dequeue(fromIndex, toIndex);
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${e}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Removed ${toIndex <= 0 ? `${fromIndex} song` : `${toIndex - fromIndex} songs`}!`)
            .setColor("GREEN"));
    }

} as InteractionFile;
