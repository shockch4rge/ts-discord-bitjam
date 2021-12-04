import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    params: {
        ephemeral: true,
        defer: true,
    },

    data: new SlashCommandBuilder()
        .setName("move-track")
        .setDescription("Move a track at an index to another one.")
        .addIntegerOption(option => option
            .setName("at-index")
            .setDescription("The index of the track to move. (min = 2)")
            .setRequired(true))
        .addIntegerOption(option => option
            .setName("to-index")
            .setDescription("Move the track to this index. (min = 2)")
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
        const atIndex = helper.getInteractionInteger("at-index")! - 1;
        const toIndex = helper.getInteractionInteger("to-index")! - 1;

        try {
            await helper.cache.service!.moveTrack(atIndex, toIndex);
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Moved track at index (${atIndex + 1}) to (${toIndex + 1})`)
            .setColor("GREEN"));
    },

} as SlashCommandFile;
