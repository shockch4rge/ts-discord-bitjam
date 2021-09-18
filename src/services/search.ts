import { Client, Message } from 'discord.js';
import { getData } from 'spotify-url-info';
import search from 'youtube-search';
import { formatDuration, youtubeOptions } from '../utils';
import { MessageLevel, deleteMessages, handleError, sendMessage } from './messaging';
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
            return await handleError(message, "You must be in a voice channel to use this command!", "❌");
        }
        return await handleSearchCommand(bot, message);
    }
}

// Main function
async function handleSearchCommand(bot: Client, message: Message) {
    let matched = message.content.match(COMMAND_SEARCH_SPOTIFY);
    let query = null;

    // No match
    if (!matched) {
        matched = message.content.match(COMMAND_SEARCH_YOUTUBE);
        if (!matched) {
            return await handleError(message, "You didn't provide a query!", "❓");
        }
        query = matched[1];
    }
    else {
        const data = await getData(matched[1]) as SpotifyTrack;
        query = `${data.name} ${data.artists[0].name} Audio`
    }

    // Calls API
    const fetched = await search(query, youtubeOptions);

    // No results returned
    if (!fetched) {
        return await handleError(message, "Could not parse search query.", "❗");
    }

    const result = fetched.results[0];
    
    bot.emit("ytUrlCreate", result, message);
}