import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { formatTime } from "../utilities/Utils";

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

        if (service.queue.length === 0) {
            return await helper.respond(new MessageEmbed()
                .setAuthor("❗  The queue is empty!")
                .setColor("GOLD"));
        }

        const queue = service.queue;
        const embed = new MessageEmbed();
        const currentSong = queue[0];
        const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        if (queue.length > 1) {
            // append songs top down from newest
            for (let i = queue.length - 1; i >= 1; i--) {
                // append up to 9 fields
                if (i <= queue.length - 11) break;

                const song = queue[i];
                embed.addField(
                    `> ${numbers[i]} :   ${song.title} :: ${song.artist}`,
                    `Duration: ${formatTime(song.duration)}`
                );
            }
        }

        embed
            .setAuthor(`🎵  Current song:`)
            .setTitle(`[${formatTime(currentSong.duration)}] - ${currentSong.title} :: ${currentSong.artist}`)
            .setImage(currentSong.cover)
            .setFooter(`🗃️ There ${queue.length === 1 ? "is 1 song" : `are ${queue.length} songs`} in the queue.`)
            .setColor("GREYPLE");

        return await helper.interaction.followUp({
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
