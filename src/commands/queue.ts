import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the current queue.")
        .addIntegerOption(option => option
            .setName("page-number")
            .setDescription("Navigate to a page in the queue.")
            .setRequired(false)),

    execute: async helper => {
        const member = helper.interaction.member as GuildMember;

        if (!helper.isMemberInBotVc(member)) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  You must be in the bot's voice channel to use this command!")
                .setColor("RED"));
        }

        const service = helper.cache.service;

        if (!service) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❌  I am not currently in a voice channel!")
                .setColor("RED"));
        }

        // may be null
        const page = helper.getInteractionInteger("page-number");

        const queue = service.queue;
        const embed = new MessageEmbed();


        let i = 0;
        for (i; i < queue.length; i++) {
            // append up to 10 fields
            if (i >= 10) break;

            const song = queue[i];
            embed.addField(`${i}. ${song.title} -> ${song.duration}`, `${song.artist}`);
        }

        embed
            .setAuthor(`Queue Size: ${queue.length} songs`, helper.cache.bot.user!.avatarURL()!)
            .setTitle(`Current song: ${queue[0].title}`)
            .setFooter(i <= 0 ? "" : `And ${queue.length - i} songs left...`)

        await helper.interaction.followUp({
            embeds: [embed],
            components: [new MessageActionRow()
                .addComponents([
                    new MessageButton()
                        .setCustomId("btn-select-page")
                        .setLabel("Select Page")
                        .setStyle("PRIMARY")
                        .setDisabled(),
                ])],
        });
    }

} as InteractionFile;
