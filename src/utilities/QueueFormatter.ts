import Track from "../models/Track";
import { MessageEmbed } from "discord.js";
import { formatTime } from "./Utils";

export class QueueFormatter {
    private readonly queue: Track[];

    public constructor(queue: Track[]) {
        this.queue = queue;
    }

    public getEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        const currentTrack = this.queue[0];
        const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        if (this.queue.length > 1) {
            embed.addField(`___`, "...");

            // append tracks top down from newest
            for (let i = 0; i < this.queue.length; i++) {
                // append up to 9 fields
                if (i >= 8) break;

                const track = this.queue[i];
                embed.addField(
                    `> ${numbers[i]} :   ${track.title} :: ${track.artist}`,
                    `Duration: ${formatTime(track.duration)} - Requested by <@!${track.requester}>`
                );
            }
        }

        embed
            .setAuthor(`🎵  Current track:`)
            .setTitle(`[${formatTime(currentTrack.duration)}] - ${currentTrack.title} :: ${currentTrack.artist}`)
            .setImage(currentTrack.cover)
            .setFooter(
                `🗃️ There ${this.queue.length === 1 
                    ? "is 1 track" 
                    : `are ${this.queue.length} tracks`} in the queue.`
            )
            .setColor("GREYPLE");

        return embed;
    }
}
