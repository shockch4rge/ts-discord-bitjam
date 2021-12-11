import Track from "../models/Track";
import { MessageEmbed } from "discord.js";
import { formatTime, TEXT } from "./Utils";

export class QueueFormatter {
    private readonly queue: Track[];

    public constructor(queue: Track[]) {
        this.queue = queue;
    }

    public getEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        const current = this.queue[0];

        if (this.queue.length > 1) {
            embed.addField(`___`, TEXT.EMPTY_SPACE);

            // append tracks top down from newest
            for (let i = 1; i < this.queue.length; i++) {
                // append up to 9 fields
                if (i >= 9) break;

                const track = this.queue[i];
                embed.addField(
                    `> ${TEXT.EMOJIS.NUMBERS[i - 1]} :   ${track.title} :: ${track.artist}`,
                    `Duration: ${formatTime(track.duration)} - Requested by <@!${track.requester}>`
                );
            }
        }

        embed
            .setAuthor(`🎵  Current track:`)
            .setTitle(`[${formatTime(current.duration)}] - ${current.title} :: ${current.artist}`)
            .setImage(current.cover)
            .setFooter(
                `🗃️ There ${this.queue.length === 1 
                    ? "is 1 track" 
                    : `are ${this.queue.length} tracks`} in the queue.`
            )
            .setColor("GREYPLE");

        return embed;
    }
}
