import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get the bot's response time, in milliseconds."),

    execute: async helper => {
        await helper.respond(new MessageEmbed()
            .setAuthor(`🕕  Pong! ${helper.cache.bot.ws.ping}ms`)
            .setColor("GOLD"))
    }

} as InteractionFile;