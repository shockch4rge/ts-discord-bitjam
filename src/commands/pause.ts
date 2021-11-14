import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the bot."),

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
            await service.pause();
        }
        catch {
            await helper.interaction.followUp({
                content: "The player is already paused!",
                ephemeral: true,
            });
            return;
        }

        await helper.interaction.followUp({
            embeds: [new MessageEmbed()
                .setTitle("✅  Paused")
                .setColor("GREEN")],
            ephemeral: true,
        });

    }
} as InteractionFile;
