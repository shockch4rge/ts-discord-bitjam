import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";
import { LoopState } from "../services/MusicService";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Toggle the queue loop. Switches between OFF, SONG & QUEUE."),

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

        service.toggleLoop();

        let stateString = "";

        switch (service.looping) {
            case LoopState.OFF:
                stateString = "Looping is now off!";
                break;
            case LoopState.SONG:
                stateString = "Looping the song!"
                break;
            case LoopState.QUEUE:
                stateString = "Looping the queue!";
                break;
        }

        await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  ${stateString}`)
            .setColor("GREEN"))
    }

} as InteractionFile;
