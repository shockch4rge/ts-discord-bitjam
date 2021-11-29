import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { LoopState } from "../services/MusicService";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Choose a looping state for music playing.")
        .addStringOption(option => option
            .setName("state")
            .setDescription("The looping state to switch to.")
            .setRequired(true)
            .addChoice("off", LoopState.OFF)
            .addChoice("track", LoopState.TRACK)
            .addChoice("queue", LoopState.QUEUE)),

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

        const loopState = helper.getInteractionString("state")! as LoopState;

        try {
            await service.setLoopingState(loopState);
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Set looping state to: ${loopState}`)
            .setColor("GREEN"))
    }

} as InteractionFile;
