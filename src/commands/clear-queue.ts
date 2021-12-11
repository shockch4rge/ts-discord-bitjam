import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    params: {
        ephemeral: true,
        defer: true
    },

    builder: new SlashCommandBuilder()
        .setName("clear-queue")
        .setDescription("Clears the queue and stops the player."),

    guard: {
        test: async helper => {
            const member = helper.interaction.member as GuildMember;

            if (!helper.isMemberInMyVc(member)) {
                throw new Error("❌  We need to be in the same voice channel to use this command!");
            }

            if (!helper.cache.service) {
                throw new Error("❌  I am not currently in a voice channel!");
            }
        },

        fail: async (helper, error) => {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`${error}`)
                .setColor("RED"));
        }
    },

    execute: async helper => {
        try {
            await helper.cache.service!.clearQueue();
        }
        catch (err) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${err}`)
                .setColor("RED"));
        }

        await helper.respond(new MessageEmbed()
            .setAuthor("✔️  Cleared queue and stopped the player.")
            .setColor("GREEN"));
    },

} as SlashCommandFile;
