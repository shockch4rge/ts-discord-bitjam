import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    params: {
        ephemeral: true,
        defer: true,
    },

    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resumes the player."),

    passCondition: helper => {
        return new Promise<void>((resolve, reject) => {
            const member = helper.interaction.member as GuildMember;

            if (!helper.isMemberInMyVc(member)) {
                reject("❌  We need to be in the same voice channel to use this command!");
            }

            if (!helper.cache.service) {
                reject("❌  I am not currently in a voice channel!");
            }

            resolve();
        });
    },

    execute: async helper => {
        try {
            await helper.cache.service!.resume();
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Resumed!")
            .setColor("GREEN"));
    },

    fail: async (helper, error) => {
        return await helper.respond(new MessageEmbed()
            .setAuthor(`${error}`)
            .setColor("RED"));
    }

} as SlashCommandFile;
