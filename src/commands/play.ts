import { Message } from "discord.js";
import { initMp3Resource, initPlayer } from "../player";
import { initConnection } from "../connection";
import { sendWarning, delay } from "../utils";

export async function playCommand(message: Message) {
    // If starts with '>>play', contains 'http(s)://', & ends with '.mp3'
    const matched = message.content.match(/(https?:\/\/.+\.mp3)\s?$/gm);

    if (!matched) {
        const warning = await sendWarning("You didn't provide a valid mp3 file/link!", message.channel);
        await delay(5000)
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }

    await message.delete().catch();
    
    const url = matched[1];
    const player = initPlayer(message);
    const connection = initConnection(message)
    const resource = initMp3Resource(url);

    connection.subscribe(player)
    player.play(resource);
}