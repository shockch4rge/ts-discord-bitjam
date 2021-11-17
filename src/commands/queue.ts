import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the current queue."),

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
            .setFooter(`And ${queue.length - i} songs left...`)

        await helper.interaction.followUp({
            embeds: [embed],
            components: [new MessageActionRow()
                .addComponents([
                    new MessageButton()
                        .setCustomId("next_page")
                        .setLabel("Next Page")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("back_page")
                        .setLabel("Previous Page")
                        .setStyle("PRIMARY")
                ])],
        });
    }

} as InteractionFile;
