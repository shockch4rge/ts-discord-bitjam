import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { initPlayer } from "../player";
import { initConnection } from "../connection";
import { sendWarning, delay } from "../utils";

export async function hiCommand(message: Message) {
    if (getVoiceConnection(message.guildId!)) {
        await message.react("❌").catch();
        const warning = await sendWarning("The player is already connected to a voice channel!", message.channel);
        await delay(5000)
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }
    
    const player = initPlayer(message);
    const connection = initConnection(message);
    connection.subscribe(player);

    await message.delete().catch();
}