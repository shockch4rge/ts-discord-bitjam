import { Client } from 'discord.js';

/* Not a command */

export function subscribeBotEvents(bot: Client) {
    bot.once("ready", handleBotReady);
}

function handleBotReady(bot: Client) {
    console.log("BitJam is ready!")
    bot.user!.setPresence({
        activities: [{ type: 'LISTENING', name: ">>help" }], 
        status: "online" 
    });
}