import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { initPlayer } from "../player";
import { sendWarning, delay } from "../utils";

export async function resumeCommand(message: Message) {
    const player = initPlayer(message);

    if 
    (
        player.state.status === AudioPlayerStatus.Paused 
        || player.state.status === AudioPlayerStatus.AutoPaused
    ) 
    {
        await message.react("❌").catch();
        const warning = await sendWarning("Something is already playing!", message.channel);
        await delay(7000);
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }
}