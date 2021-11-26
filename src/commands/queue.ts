import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { QueueFormatter } from "../utilities/QueueFormatter";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the current queue."),

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

        if (service.queue.length === 0) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❗  The queue is empty!")
                .setColor("GOLD"));
        }

        const embed = new QueueFormatter(service.queue).getEmbed();

        return await helper.respond(embed);
    }

} as InteractionFile;
