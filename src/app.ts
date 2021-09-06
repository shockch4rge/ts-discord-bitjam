import { Client, Intents } from "discord.js";
import { BOT_TOKEN } from "./auth.json"
import { helpCommand } from "./commands/help";
import { pingCommand } from "./commands/ping";
import { playCommand } from "./commands/play";

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
    if (message.author.id !== "217601815301062656") return;

    if (message.content === ">>help") {
        helpCommand(bot, message);
        return;
    }
    else if (message.content === ">>ping") {
        pingCommand(bot, message);
        return;
    }

    if (message.content.startsWith(">>search")) {

    }
    else if (message.content.startsWith(">>play")) {
        playCommand(bot, message);
        return;
    }
});

void bot.login(BOT_TOKEN);