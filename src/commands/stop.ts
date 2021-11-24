import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Clears the queue and stops the player."),

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

        try {
            await service.stop();
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${e}`)
                .setColor("RED"));
        }

        await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Cleared queue and stopped the player.")
            .setColor("GREEN"));
    }

} as InteractionFile;
