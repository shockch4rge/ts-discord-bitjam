import { Client, Message } from 'discord.js';
import search from 'youtube-search';
import { formatDuration, YoutubeOptions } from '../utils';
import { deleteMessages, sendMessage, sendWarning } from './messaging';
import { handleUserNotConnected } from './messaging';

const COMMAND_SEARCH = /^>>search\s?/;
const STRICT_COMMAND_SEARCH = /^>>search\s(.+)/;

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
    const matched = message.content.match(STRICT_COMMAND_SEARCH);

    // No match
    if (!matched) {
        return await handleInvalidMatch(message);
    }

    const query = matched[1];

    // Calls API
    const fetched = await search(query, YoutubeOptions);

    // No results returned
    if (!fetched) {
        return await handleSearchFailure(message);
    }

    const result = fetched.results[0];
    
    bot.emit("youtubeLinkFetch", result.link, message);

    const msg = await sendMessage(message, {  
        author: "Now playing...", 
        title: `${result.title}`,
        url: `${result.link}`,
        imageUrl: `${result.thumbnails.high?.url}`,
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

