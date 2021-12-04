import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { QueueFormatter } from "../utilities/QueueFormatter";

module.exports = {
    params: {
        ephemeral: true,
        defer: true,
    },

    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the current queue."),

    guard: {
        test: async helper => {
            if (!helper.cache.service) {
                throw new Error("❌  I am not currently in a voice channel!");
            }
            if (helper.cache.service!.queue.length <= 0) {
                throw new Error("❗  The queue is empty!");
            }
        },

        fail: async (helper, error) => {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌ ${error}`)
                .setColor("RED"));
        },
    },

    execute: async helper => {
        const embed = new QueueFormatter(helper.cache.service!.queue).getEmbed();
        return await helper.respond(embed);
    },

} as SlashCommandFile;
