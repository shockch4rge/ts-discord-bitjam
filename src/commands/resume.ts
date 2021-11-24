import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resumes the player."),

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

        try {
            await service.resume();
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setTitle(`❌  ${e}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Resumed!")
            .setColor("GREEN"));
    }

} as InteractionFile;
