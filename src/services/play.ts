import { Client, Message } from "discord.js";
import { initMp3Resource, initPlayer } from "../player";
import { initConnection } from "../connection";
import { deleteMessages, sendWarning } from "./messaging";

// If starts with '>>play ', contains 'http(s)://', chars 'a-z, 0-9, @, ., /, -', & ends with '.mp3'
const COMMAND_PLAY = /^>>play\s(https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$)/i

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", handleMessageCreate);
}

async function handleMessageCreate(message: Message) {
    if (!COMMAND_PLAY.test(message.content)) {
        return await handleInvalidMatch(message);
    }
    
    return await handlePlayCommand(message);
}

// Main function
async function handlePlayCommand(message: Message) {
    const url = message.content.match(COMMAND_PLAY)![1];

    const player = initPlayer(message);
    const connection = initConnection(message);
    const resource = initMp3Resource(url);

    connection.subscribe(player);
    player.play(resource);
    await deleteMessages([message], 0);
}

async function handleInvalidMatch(message: Message) {
    await message.react("❓").catch();
    const warning = await sendWarning(message, "You didn't provide a valid mp3 file/link!");
    await deleteMessages([warning, message]);
}