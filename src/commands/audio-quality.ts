import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { AudioQuality } from "../models/Track";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
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
    }

} as InteractionFile;
