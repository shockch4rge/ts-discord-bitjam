import { Client, Intents } from "discord.js";
import { BOT_TOKEN } from "./auth.json"
import { byeCommand } from "./commands/bye";
import { helpCommand } from "./commands/help";
import { hiCommand } from "./commands/hi";
import { pingCommand } from "./commands/ping";
import { playCommand } from "./commands/play";
import { searchCommand } from "./commands/search";
import { sendWarning, delay } from "./utils";

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

    // '>>help'
    if (message.content.match(/^>>help/)) {
        helpCommand(message);
        return;
    }

    // '>>ping'
    else if (message.content.match(/^>>ping/)) {
        pingCommand(bot.ws.ping, message);
        return;
    }

    // Commands that need the user to be connected to a voice channel
    if (
        message.content.match(/^>>search\s+(.+)/)
        || message.content.match(/^>>play\s.+/)
        || message.content.match(/^>>hi/)
        || message.content.match(/^>>bye/)
    )
    {
        if (!message.member!.voice.channel) {
            await message.react("❌").catch();
            const warning = await sendWarning("You must be in a voice channel to use this command!", message.channel);
            await delay(5000);
            await warning.delete().catch();
            await message.delete().catch();
            return;
        }
    }

    // '>>search <query>'
    if (message.content.startsWith(">>search")) {
        searchCommand(message);
        return;
    }

    // '>>play <url>'
    else if (message.content.match(/^>>play\s.+/)) {
        playCommand(message);
        return;
    }

    // '>>hi'
    else if (message.content.match(/^>>hi/)) {
        hiCommand(message);
        return;
    }

    // '>>bye'
    else if (message.content.match(/^>>bye/)) {
        byeCommand(message);
        return;
    }
});

void bot.login(BOT_TOKEN);