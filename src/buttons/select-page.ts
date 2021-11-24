import { GuildMember } from "discord.js";
import { ButtonFile } from "../helpers/BotHelper";

module.exports = {
    id: "btn-select-page",
    execute: async helper => {
        const member = helper.interaction.member as GuildMember;
        const service = helper.cache.service!;

    }
} as ButtonFile
