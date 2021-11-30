import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { QueueFormatter } from "../utilities/QueueFormatter";

module.exports = {
    params: {
        ephemeral: true,
        defer: false,
    },

    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the current queue."),

    passCondition: helper => {
        return new Promise<void>((resolve, reject) => {
            if (!helper.cache.service) {
                reject("❌  I am not currently in a voice channel!");
            }
            if (helper.cache.service!.queue.length <= 0) {
                reject("❗  The queue is empty!");
            }

            resolve();
        })

    },

    execute: async helper => {
        const embed = new QueueFormatter(helper.cache.service!.queue).getEmbed();
        return await helper.respond(embed);
    },

    fail: async (helper, error) => {
        return await helper.respond(new MessageEmbed()
            .setAuthor(`❌ ${error}`)
            .setColor("RED"))
    }

} as SlashCommandFile;
