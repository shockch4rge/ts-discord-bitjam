import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { LoopState } from "../services/MusicService";

module.exports = {
    params: {
        ephemeral: true,
        defer: false,
    },

    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Choose a looping state for music playing.")
        .addStringOption(option => option
            .setName("state")
            .setDescription("The looping state to switch to.")
            .setRequired(true)
            .addChoice("off", "OFF")
            .addChoice("track", "TRACK")
            .addChoice("queue", "QUEUE")),

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
        const loopState = helper.getInteractionString("state")! as LoopState;

        try {
            await helper.cache.service!.setLoopingState(loopState);
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Set looping state to: ${loopState}`)
            .setColor("GREEN"));
    },

} as SlashCommandFile;
