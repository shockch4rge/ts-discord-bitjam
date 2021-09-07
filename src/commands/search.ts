import { Message } from 'discord.js';
import search from 'youtube-search';
import { createEmbed, formatDuration, sendWarning, YoutubeOptions, delay } from '../utils';
import { YT_TOKEN } from '../auth.json';
import { initPlayer, initYoutubeResource } from '../player';

export async function searchCommand(message: Message) {
    const matched = message.content.match(/^>>search\s+(.+)/);

    if (!matched) {
        await message.react("❓").catch();
        const warning = await sendWarning("You didn't provide a query!", message.channel);
        await delay(5000);
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }

    const query = matched[1];

    // Calls API
    const fetched = await search(query, 
        { 
            maxResults: 1, 
            key: YT_TOKEN, 
            type: 'audio' 
        }
    );

    // Could not return any results
    if (!fetched) {
        const warning = await sendWarning("Could not parse search query.", message.channel);
        await delay(5000);
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }

    const result = fetched.results[0];
    const resource = initYoutubeResource(result.link);

    // Invalid URL returned from Youtube
    if (!resource) {
        const warning = await sendWarning("Invalid YouTube URL!", message.channel);
        await delay(5000);
        await warning.delete().catch();
        await message.delete().catch();
        return;
    }
    
    const player = initPlayer(message);
    player.play(resource);

    const msg = await message.channel.send(
        { 
            embeds: [createEmbed(
                {  
                    author: "Now playing...", 
                    title: `${result.title}`,
                    url: `${result.link}`,
                    imageUrl: `${result.thumbnails.high?.url}`,
                    footer: 
                    resource!.playbackDuration === 0
                    ? ""
                    : `Duration: ${formatDuration(resource!.playbackDuration)}`
                }
            )]
        }
    );

    await message.delete().catch();
}