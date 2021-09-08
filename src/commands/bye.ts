import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";
import { destroyConnection } from "../connection";
import { sendWarning, delay } from "../utils";

export async function byeCommand(message: Message) {
    const connection = getVoiceConnection(message.guildId!)

    // Connection doesn't exist at all
    if (!connection) {
        await message.react("❌").catch();
        const warning = await sendWarning("The player is not connected to a voice channel!", message.channel);
        await delay(5000)
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }

    await message.delete().catch();
    destroyConnection(connection);
}