import { Client, Intents } from "discord.js";
import BotHelper from "./helpers/BotHelper";

const auth = require("./auth.json")


const bot = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES,]});

const botHelper = new BotHelper(bot)
botHelper.setup();

void bot.login(auth.bot_token);
