import {Client, Intents} from "discord.js";
import {BOT_TOKEN} from "./auth.json"
import * as test from "./services-old/testing"
import * as ping from "./services-old/ping";
import * as ready from "./services-old/ready";
import * as help from "./services-old/help";
import * as createChannel from "./services-old/createchannel";
import * as search from "./services-old/search";
import * as player from "./services-old/player";
import * as channel from "./services-old/channel";
import {MainController} from "./controllers/MainController";
import {BotService} from "./services/BotService";
import {AudioService} from "./services/AudioService";
import {MessagingService} from "./services/MessagingService";
import Track from "./services/Track";
import {Command} from "./commands/Command";

const bot = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES,]});
const botService = new BotService(bot);
const audioService = new AudioService();
const messagingService = new MessagingService();
const mainController = new MainController(botService, audioService, messagingService);

mainController.subscribeBotEvents(bot);

// const services =
// [
//     ready,
//     test,
//     ping,
//     help,
//     channel,
//     player,
//     createChannel,
//     search,
// ];
//
// for (const service of services) {
//     service.subscribeBotEvents(bot);
// }

void bot.login(BOT_TOKEN);