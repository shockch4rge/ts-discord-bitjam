import { ButtonFile } from "../helpers/BotHelper";
import { GuildMember } from "discord.js";

module.exports = {
    id: "skip",
    execute: async helper => {
        const member = helper.interaction.member as GuildMember;
    }

} as ButtonFile;
