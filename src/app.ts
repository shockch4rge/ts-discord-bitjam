import { Client, Intents } from "discord.js";
import { BOT_TOKEN } from "./auth.json"
import * as test from "./services/testing"
import * as ping from "./services/ping";
import * as ready from "./services/ready";
import * as help from "./services/help";
import * as createChannel from "./services/createchannel";
import * as search from "./services/search";
import * as player from "./services/player";
import * as channel from "./services/channel";

const bot = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ]
});

const services = 
[
    ready, 
    test,
    ping, 
    help, 
    channel, 
    player, 
    createChannel, 
    search,
];

for (const service of services) {
    service.subscribeBotEvents(bot);
}

void bot.login(BOT_TOKEN);