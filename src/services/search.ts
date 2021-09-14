import { Client, Message } from 'discord.js';
import { getData } from 'spotify-url-info';
import search from 'youtube-search';
import { formatDuration, MessageLevel, YoutubeOptions } from '../utils';
import { deleteMessages, sendMessage, sendWarning } from './messaging';
import { handleUserNotConnected } from './messaging';
import { SpotifyTrack } from '../types';

const COMMAND_SEARCH = /^>>search\s?/;
const COMMAND_SEARCH_YOUTUBE = /^>>search\s(.+)/;
const COMMAND_SEARCH_SPOTIFY = /^>>search\s(https:\/\/open.spotify.com\/track\/[a-z0-9]+)(\?si=.+)/i;

export function subscribeBotEvents(bot: Client) {
    bot.on("messageCreate", async message => {
        return await handleMessageCreate(bot, message);
    });
}

async function handleMessageCreate(bot: Client, message: Message) {    
    if (message.author.bot) return;

    if (COMMAND_SEARCH.test(message.content)) {
        if (!message.member?.voice.channel) {
            return await handleUserNotConnected(message);
        }
        return await handleSearchCommand(bot, message);
    }
}

// Main function
async function handleSearchCommand(bot: Client, message: Message) {
    let matched = message.content.match(COMMAND_SEARCH_SPOTIFY);
    let query;

    // No match
    if (!matched) {
        matched = message.content.match(COMMAND_SEARCH_YOUTUBE);
        if (!matched) {
            return await handleInvalidMatch(message);
        }
        query = matched[1];
    }
    else {
        const data = await getData(matched[1]) as SpotifyTrack;
        query = `${data.name} ${data.artists[0].name} Audio`
    }

    // Calls API
    const fetched = await search(query, YoutubeOptions);

    // No results returned
    if (!fetched) {
        return await handleSearchFailure(message);
    }

    const result = fetched.results[0];
    
    bot.emit("ytUrlCreate", result.link, message);

    const msg = await sendMessage(message, {  
        author: "Now playing...", 
        title: `${result.title.toString()}`,
        url: `${result.link}`,
        imageUrl: `${result.thumbnails.high?.url}`,
        level: MessageLevel.PROMPT,
    });

    await deleteMessages([message], 0);
    await deleteMessages([msg], 30000);
}


async function handleInvalidMatch(message: Message) {
    await message.react("❓").catch();
    const warning = await sendWarning(message, "You didn't provide a query!");
    await deleteMessages([warning, message]);
}

async function handleSearchFailure(message: Message) {
    await message.react("❗").catch();
    const warning = await sendWarning(message, "Could not parse search query.")
    await deleteMessages([warning, message]);
}

