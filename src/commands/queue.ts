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

        const queue = service.queue;
        const embed = new MessageEmbed();
        const numbers = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

        embed.addField("___", "...");

        // append the rows top down from highest
        for (let i = queue.length - 1; i >= 0; i--) {
            // append up to 10 fields
            if (i <= queue.length - 10) break;

            const song = queue[i];
            embed.addField(
                `> ${numbers[i]} :   ${song.title} - ${song.artist}`,
                `Duration: ${formatTime(song.duration)}`
            );
        }

        embed
            .setTitle(`Current song: ${queue[0].title}`)
            .setImage(queue[0].cover)
            .setFooter(`🗃️ There are ${queue.length} ${queue.length === 1 ? "song" : "songs"} in the queue.`)
            .setColor("GREYPLE");

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
