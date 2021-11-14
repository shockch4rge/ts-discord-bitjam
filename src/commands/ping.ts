import { InteractionFile } from "../helpers/BotHelper";
import { SlashCommandBuilder } from "@discordjs/builders";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get the bot's response time, in milliseconds."),

    execute: async helper => {
        await helper.interaction.followUp({
            content: `Pong! ${helper.cache.bot.ws.ping}ms`,
            ephemeral: true,
        });
    }

} as InteractionFile;
