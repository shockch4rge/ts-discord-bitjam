import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { initPlayer } from "../player";
import { createEmbed, delay, MessagePriority, sendWarning } from "../utils";

export async function pauseCommand(message: Message) {
    const player = initPlayer(message);

    if 
    (
        player.state.status === AudioPlayerStatus.Paused 
        || player.state.status === AudioPlayerStatus.AutoPaused
    ) 
    {
        await message.react("❌").catch();
        const warning = await sendWarning("The player is already paused!", message.channel);
        await delay(7000);
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }

    player.pause(true);
    await message.delete().catch();

    const msg = await message.channel.send({
        embeds: [createEmbed({
            author: "The player is now paused!",
            priority: MessagePriority.SUCCESS
        })]
    });
    await delay(5000);
    await msg.delete().catch();
}