import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Collection } from "discord.js";
import { InteractionFile } from "../helpers/BotHelper";

const auth = require("../../auth.json");

export default class SlashCommandDeployer {
    private readonly guildId: string;
    private readonly commands: SlashCommandBuilder[];
    private readonly interactionFiles: Collection<string, InteractionFile>

    public constructor(guildId: string, interactionFiles: Collection<string, InteractionFile>) {
        this.guildId = guildId;
        this.interactionFiles = interactionFiles;
        this.commands = [];

        this.interactionFiles.forEach(file => this.commands.push(file.data));
    }

    public async deploy() {
        const rest = new REST({ version: "9" }).setToken(auth.bot_token);
        await rest.put(
            Routes.applicationGuildCommands(auth.app_id, this.guildId),
            {
                body: this.commands.map(command => command.toJSON()),
            }
        );
    }
}
