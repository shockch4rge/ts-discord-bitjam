import { Client, Intents } from "discord.js";
import { BOT_TOKEN } from "./auth";
import { ping } from "./commands/ping";

const bot = new Client(
    { 
        intents: [
            Intents.FLAGS.GUILDS, 
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_VOICE_STATES
        ]
    }
);

bot.once("ready", () => {
    console.log("BitJam is ready!");
    bot.user!.setPresence({ activities: [{ type: 'LISTENING', name: ">>help" }], status: "online" });
});

bot.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (message.content === ">>ping") {
        ping(bot, message);
    }
});

bot.login(BOT_TOKEN);