import { Client, Message } from "discord.js";

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", handleMessageCreate);
}

async function handleMessageCreate(message: Message) {
    if (message.author.bot) return;

}

async function handleTestCommand(message: Message) {
    
}