import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current track in the queue."),

    execute: async helper => {
        const member = helper.interaction.member as GuildMember;

        if (!helper.isMemberInBotVc(member)) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  You must be in the bot's voice channel to use this command!")
                .setColor("RED"));
        }

        const service = helper.cache.service;

        if (!service) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  I am not currently in a voice channel!")
                .setColor("RED"));
        }

        try {
            await service.skip();
        }
        catch (e) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${e}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Skipped!")
            .setColor("GREEN"));
    }

} as InteractionFile;
