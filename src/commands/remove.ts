import { SlashCommandFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, MessageEmbed } from "discord.js";

module.exports = {
    params: {
        ephemeral: true,
        defer: true,
    },

    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove a single/range of tracks from specified indexes.")
        .addIntegerOption(option => option
            .setName("from-index")
            .setDescription("Start removing tracks at this index. Fill only this option to remove one track. (min: 2)")
            .setRequired(true))
        .addIntegerOption(option => option
            .setName("to-index")
            .setDescription("Remove tracks up to this index. Leave empty to remove only one. (max: queue length - 1)")
            .setRequired(false)),

    passCondition: helper => {
        return new Promise<void>((resolve, reject) => {
            const member = helper.interaction.member as GuildMember;

            if (!helper.isMemberInMyVc(member)) {
                reject("❌  We need to be in the same voice channel to use this command!");
            }

            if (!helper.cache.service) {
                reject("❌  I am not currently in a voice channel!");
            }

            resolve();
        });
    },

    execute: async helper => {
        const fromIndex = helper.getInteractionInteger("from-index")! - 1;
        const toIndex = helper.getInteractionInteger("to-index") ?? 0;

        try {
            await helper.cache.service!.remove(fromIndex, toIndex);
        }
        catch ({ message }) {
            return await helper.respond(new MessageEmbed()
                .setAuthor(`❌  ${message}`)
                .setColor("RED"));
        }

        return await helper.respond(new MessageEmbed()
            .setAuthor(`✔️  Removed ${toIndex <= 0 ? `${fromIndex} track` : `${toIndex - fromIndex} tracks`}!`)
            .setColor("GREEN"));
    },

    fail: async (helper, error) => {
        return await helper.respond(new MessageEmbed()
            .setAuthor(`${error}`)
            .setColor("RED"));
    }

} as SlashCommandFile;
