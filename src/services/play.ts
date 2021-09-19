import { Client, Message } from "discord.js";
import { initMp3Resource, initPlayer } from "../player";
import { initConnection } from "../connection";
import { deleteMessages, sendWarning } from "./messaging";
import { handleUserNotConnected } from "../utils";

// If starts with '>>play ', contains 'http(s)://', chars 'a-z, 0-9, @, ., /, -', & ends with '.mp3'
const COMMAND_PLAY = /^>>play\s?/i
const STRICT_COMMAND_PLAY = /^(>>play)(\s?https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$)/i

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", handleMessageCreate);
}

async function handleMessageCreate(message: Message) {
    if (message.author.bot) return;

    if (COMMAND_PLAY.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }

       return await handlePlayCommand(message);
    }
}

// Main function
async function handlePlayCommand(message: Message) {
    const matched = message.content.match(STRICT_COMMAND_PLAY);

    if (!matched) {
        return await handleInvalidMatch(message);
    }

    const url = matched[1].trim();
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