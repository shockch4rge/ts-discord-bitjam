import { Message } from "discord.js";
import { createEmbed, delay } from "../utils";

export async function helpCommand(message: Message) {
    const embed = createEmbed(
        {  
            author: "Commands", 
            fields: [
                { name: "`>>search <query>`", value: "Plays an MP3 file or a YouTube link.", inline: true },
                { name: "`>>play <url>`", value: "Searches for a song on Youtube.", inline: true },
                { name: "`>>pause`", value: "Pauses the player.", inline: true },
                { name: "`>>resume`", value: "Resumes the player.", inline: true },
                { name: "`>>skip`", value: "Skips to the next song in the queue, if there is one.", inline: true },
                { name: "`>>queue`", value: "Displays the current queue.", inline: true },
                { name: "`>>hi`", value: "Connects the player to the voice channel.", inline: true },
                { name: "`>>bye`", value: "Disconnects the player from the voice channel.", inline: true },
                { name: "`>>ping`", value: "Check the response time of the bot, in milliseconds.", inline: true },
            ],
            footer: "❗ All commands listed here except for '>>ping' require you to be in a voice channel."
        }
    );
    const msg = await message.channel.send({ embeds: [embed] });
    await message.delete().catch();
    await delay(30000);
    await msg.delete().catch();
    return;    
}