import {Client, Intents} from "discord.js";
import {BOT_TOKEN} from "./auth.json";
import {MainController} from "./controllers/MainController";

const bot = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES,]});

const mainController = new MainController(bot);
mainController.subscribeBotEvents();

void bot.login(BOT_TOKEN);