import { Client, Intents } from "discord.js";
import { BOT_TOKEN } from "./auth.json"
import * as ping from "./services/ping";
import * as ready from "./services/ready";
import * as help from "./services/help";
import * as hi from "./services/hi";
import * as bye from "./services/bye";
import * as pause from "./services/pause";
import * as resume from "./services/resume";
import * as play from "./services/play";
import * as createChannel from "./services/createchannel";
import * as search from "./services/search";

const bot = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ]
});

// on bot ready
ready.subscribeBotEvents(bot);

// '>>help': Show all command info
help.subscribeBotEvents(bot);

// '>>ping': Receive the response time of the bot
ping.subscribeBotEvents(bot);

// '>>channel': Create a dedicated channel that takes in only search queries
createChannel.subscribeBotEvents(bot);

// '>>search <query>': Search for a song on YouTube
search.subscribeBotEvents(bot);

// '>>play <url>': Play a .mp3 file
play.subscribeBotEvents(bot);

// '>>pause': Pause the player
pause.subscribeBotEvents(bot);

// '>>resume': Resume the player
resume.subscribeBotEvents(bot);

// '>>hi': Connect the player to the voice channel
hi.subscribeBotEvents(bot);

// '>>bye': Disconnect the player from the voice channel
bye.subscribeBotEvents(bot);

void bot.login(BOT_TOKEN);