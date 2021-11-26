import Song from "../models/Song";
import { MessageEmbed } from "discord.js";
import { formatTime } from "./Utils";

export class QueueFormatter {
    private readonly queue: Song[];

    public constructor(queue: Song[]) {
        this.queue = queue;
    }

    public getEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        const currentSong = this.queue[0];
        const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        if (this.queue.length > 1) {
            embed.addField(`___`, "...");

            // append songs top down from newest
            for (let i = 1; i < this.queue.length; i++) {
                // append up to 9 fields
                if (i >= 9) break;

                const song = this.queue[i];
                embed.addField(
                    `> ${numbers[i]} :   ${song.title} :: ${song.artist}`,
                    `Duration: ${formatTime(song.duration)} - Requested by <@!${song.requester}>`
                );
            }
        }

        embed
            .setAuthor(`🎵  Current song:`)
            .setTitle(`[${formatTime(currentSong.duration)}] - ${currentSong.title} :: ${currentSong.artist}`)
            .setImage(currentSong.cover)
            .setFooter(
                `🗃️ There ${this.queue.length === 1 
                    ? "is 1 song" 
                    : `are ${this.queue.length} songs`} in the queue.`
            )
            .setColor("GREYPLE");

        return embed;
    }
}
