import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove a single/range of tracks from specified indexes.")
        .addIntegerOption(option => option
            .setName("from-index")
            .setDescription("Start removing tracks at this index. Fill only this option to remove one track. (min: 2)")
            .setRequired(true))
        .addIntegerOption(option => option
            .setName("to-index")
            .setDescription("Remove tracks up to this index. Leave empty to remove only one. (max: queue length - 1)")
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

        const fromIndex = helper.getInteractionInteger("from-index")! - 1;
        const toIndex = helper.getInteractionInteger("to-index") ?? 0;

        try {
            await service.remove(fromIndex, toIndex);
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Removed ${toIndex <= 0 ? `${fromIndex} track` : `${toIndex - fromIndex} tracks`}!`)
            .setColor("GREEN"));
    }

} as InteractionFile;
