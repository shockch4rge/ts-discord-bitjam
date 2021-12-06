import { Client, Collection, Message } from "discord.js";
import fs from "fs";
import path from "path";
import SlashCommandDeployer from "../utilities/SlashCommandDeployer";
import GuildCache from "../db/GuildCache";
import BotCache from "../db/BotCache";
import { SlashCommandHelper } from "./SlashCommandHelper";
import { ButtonHelper } from "./ButtonHelper";
import { delay } from "../utilities/Utils";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { SelectMenuHelper } from "./SelectMenuHelper";

export default class BotHelper {
	public readonly bot: Client;
	public readonly botCache: BotCache;
	public readonly messageFiles: Collection<string, Message>;
	public readonly slashCommandFiles: Collection<string, SlashCommandFile>;
	public readonly buttonFiles: Collection<string, ButtonFile>;
	public readonly menuFiles: Collection<string, MenuFile>

	public constructor(bot: Client) {
		this.bot = bot;
		this.botCache = new BotCache(this.bot);

		this.messageFiles = new Collection<string, Message>();
		this.slashCommandFiles = new Collection<string, SlashCommandFile>();
		this.buttonFiles = new Collection<string, ButtonFile>();
		this.menuFiles = new Collection<string, MenuFile>()
	}

	public setup() {
		this.setupCommandInteractions();
		this.setupButtonInteractions();
		this.setupMenuInteractions()
		this.setupBotEvents();
	}

	private setupBotEvents() {
		// ready
		this.bot.on("ready", async bot => {
			const guilds = this.bot.guilds.cache.toJSON();

			for (const guild of guilds) {
				let cache: GuildCache | undefined;

				try {
					cache = await this.botCache.getGuildCache(guild);
				}
				catch (err) {
					// @ts-ignore
					console.error(`❌  Couldn't find ${guild.name}`);
					continue;
				}

				// deploy/refresh slash commands for each guild
				const deployer = new SlashCommandDeployer(guild.id, this.slashCommandFiles);

				try {
					await deployer.deploy();
				}
				catch (err) {
					// @ts-ignore
					console.error(`❌  Failed to deploy commands in ${guild.name}: ${err.message}`);
					continue;
				}

				console.log(`✅  Restored cache for ${guild.name}`);
			}

			console.log(`${bot.user.tag} is ready!`);
		});

		this.bot.on("error", error => console.error(`❗  ERROR - ${error.name}: ${error.message}`));

		// messageCreate
		this.bot.on("messageCreate", async message => {
			if (message.author.bot) return;
			if (!message.guild) return;

			if (/^\|ping/.test(message.content)) {
				await message.reply({ content: `Pong! ${this.bot.ws.ping}ms` });
				return;
			}
		});

		// interactionCreate
		this.bot.on("interactionCreate", async interaction => {
			if (!interaction.guild) return;

			const guildCache = await this.botCache.getGuildCache(interaction.guild);

			// Slash command
			if (interaction.isCommand()) {
				const slashCommandFile = this.slashCommandFiles.get(interaction.commandName);
				if (!slashCommandFile) return;

				if (slashCommandFile.params.defer) {
					await interaction.deferReply({
						ephemeral: slashCommandFile.params.ephemeral,
					}).catch(() => {});
				}

				const helper = new SlashCommandHelper(guildCache, interaction);

				if (slashCommandFile.guard) {
					try {
						await slashCommandFile.guard.test(helper);
					}
					catch (error: any) {
						await slashCommandFile.guard.fail(helper, error.message);
						return;
					}
				}

				await slashCommandFile.execute(helper);
			}

			// Button command
			if (interaction.isButton()) {
				const buttonFile = this.buttonFiles.get(interaction.customId);
				if (!buttonFile) return;

				const helper = new ButtonHelper(guildCache, interaction);

				try {
					await buttonFile.execute(helper);
				}
				catch (err) {
					console.warn(err);
					await interaction.reply({ content: "There was an error executing this button!" });
					await delay(5000);
					await interaction.deleteReply().catch(() => {});
				}
			}

			// Select menu
			if (interaction.isSelectMenu()) {
				const menuFile = this.menuFiles.get(interaction.customId);
				if (!menuFile) return;

				const helper = new SelectMenuHelper(guildCache, interaction);

				try {
					await menuFile.execute(helper);
				}
				catch (err) {
					console.warn(err);
					await helper.update({
						content: "There was an error executing this menu!",
						components: [],
					});
					await delay(5000);
					await interaction.deleteReply().catch(() => {});
				}
			}
		});

		// guildCreate
		this.bot.on("guildCreate", async guild => {
			await this.botCache.createGuildCache(guild);

			const deployer = new SlashCommandDeployer(guild.id, this.slashCommandFiles);

			try {
				await deployer.deploy();
			}
			catch (err) {
				// @ts-ignore
				console.error(`❌  Failed to deploy commands in ${guild.name}: ${err.message}`);
			}
		});

		// guildDelete
		this.bot.on("guildDelete", async guild => {
			console.log(`Removed from guild: ${guild.name}`);
			await this.botCache.deleteGuildCache(guild.id);
		});
	}

	private setupCommandInteractions() {
		let fileNames: string[];

		try {
			// don't filter with .ts suffix as they could be directories
			fileNames = fs.readdirSync(path.join(__dirname, "../commands"))
				.filter(fileName => BotHelper.isFile(fileName));
		}
		catch (err) {
			// @ts-ignore
			console.error(`There was an error reading a file: ${err.message}`);
			return;
		}

		for (const fileName of fileNames) {
			const slashCommandFile = require(`../commands/${fileName}`) as SlashCommandFile;
			this.slashCommandFiles.set(slashCommandFile.builder.name, slashCommandFile);
		}
	}

	private setupButtonInteractions() {
		let fileNames: string[];

		try {
			fileNames = fs.readdirSync(path.join(__dirname, "../buttons"))
				.filter(fileName => BotHelper.isFile(fileName));
		}
		catch (err) {
			// @ts-ignore
			console.error(`There was an error reading a file: ${err.message}`);
			return;
		}

		for (const fileName of fileNames) {
			const buttonFile = require(`../buttons/${fileName}`) as ButtonFile;
			this.buttonFiles.set(buttonFile.id, buttonFile);
		}
	}

	private setupMenuInteractions() {
		let fileNames: string[];

		try {
			fileNames = fs.readdirSync(path.join(__dirname, "../menus"))
				.filter(fileName => BotHelper.isFile(fileName));
		}
		catch (err) {
			// @ts-ignore
			console.error(`There was an error reading a file: ${err.message}`);
			return;
		}

		for (const fileName of fileNames) {
			const menuFile = require(`../menus/${fileName}`) as MenuFile;
			this.menuFiles.set(menuFile.id, menuFile);
		}
	}

	private static isFile(fileName: string) {
		return fileName.endsWith(".ts") || fileName.endsWith(".js");
	}

	private static isDir(path: fs.PathLike) {
		try {
			const stat = fs.lstatSync(path)
			const yesDir = stat.isDirectory();
			const yesFile = stat.isFile();

			console.log(yesDir);
			return stat.isDirectory();
		}
		catch (error) {
			// @ts-ignore
			console.log(error.message);
			return false;
		}
	}
}

export type SlashCommandFile = {
	params: {
		defer: boolean,
		ephemeral: boolean,
	}
	builder: SlashCommandBuilder,
	guard?: {
		test: (helper: SlashCommandHelper) => Promise<void>,
		fail: (helper: SlashCommandHelper, error: string) => Promise<void>,
	},
	execute: (helper: SlashCommandHelper) => Promise<void>,
}

export type SlashSubCommandFile = {
	params: {
		defer: boolean,
		ephemeral: boolean,
	},
	builder: SlashCommandSubcommandBuilder,
	guard?: {
		test: (helper: SlashCommandHelper) => Promise<void>,
		fail: (helper: SlashCommandHelper, error: string) => Promise<void>,
	},
	execute: (helper: SlashCommandHelper) => Promise<void>,
}

export type ButtonFile = {
	id: string,
	execute: (helper: ButtonHelper) => Promise<void>;
}

export type MenuFile = {
	params: {
		defer: boolean,
		ephemeral: boolean,
	}
	guard?: {
		test: (helper: SelectMenuHelper) => Promise<void>,
		fail: (helper: SelectMenuHelper, error: string) => Promise<void>,
	},
	id: string,
	execute: (helper: SelectMenuHelper) => Promise<void>;
}
