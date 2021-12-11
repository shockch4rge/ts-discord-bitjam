import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    params: {
        ephemeral: true,
        defer: true,
    },

    builder: new SlashCommandBuilder()
        .setName("move-track")
        .setDescription("Move a track at an index to another one.")
        .addIntegerOption(option => option
            .setName("at")
            .setDescription("The index of the track to move. (min = 1)")
            .setRequired(true))
        .addIntegerOption(option => option
            .setName("to")
            .setDescription("Move the track to this index. (min = 1)")
            .setRequired(true)),

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
        const atIndex = helper.integer("at-index")!;
        const toIndex = helper.integer("to-index")!;

        try {
            await helper.cache.service!.moveTrack(atIndex, toIndex);
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Moved track at index (${atIndex}) to (${toIndex})`)
            .setColor("GREEN"));
    },

} as SlashCommandFile;
