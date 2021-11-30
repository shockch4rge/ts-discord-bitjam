import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { AudioQuality } from "../models/Track";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    params: {
        ephemeral: true,
        defer: false,
    },

    data: new SlashCommandBuilder()
        .setName("audio-quality")
        .setDescription("Adjust the streaming quality of the resource.")
        .addStringOption(option => option
            .setName("quality")
            .setDescription("Choose the desired streaming quality. (low = 16000hz, medium = 32000hz, high = 48000hz)")
            .setRequired(true)
            .addChoice("low", "LOW")
            .addChoice("medium", "MEDIUM")
            .addChoice("high", "HIGH")),

    passCondition: helper => {
        return new Promise<void>((resolve, reject) => {
            const member = helper.interaction.member as GuildMember;

            if (!helper.isMemberInMyVc(member)) {
                reject("❌  We need to be in the same voice channel to use this command!");
            }

            if (!helper.cache.service) {
                reject("❌  I am not currently in a voice channel!")
            }

            resolve();
        });
    },

    execute: async helper => {
        const service = helper.cache.service!;
        const audioQuality = helper.getInteractionString("quality")! as AudioQuality;

        try {
            await service.setAudioQuality(audioQuality);
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Streaming quality set to ${audioQuality}hz.`)
            .setColor("GREEN"));
    },

    fail: async (helper, error) => {
        return await helper.respond(new MessageEmbed()
            .setAuthor(`${error}`)
            .setColor("RED"));
    }
} as SlashCommandFile;
