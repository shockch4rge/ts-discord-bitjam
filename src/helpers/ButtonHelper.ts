import { InteractionHelper } from "../utilities/InteractionHelper";
import { ButtonInteraction } from "discord.js";
import GuildCache from "../db/GuildCache";

export class ButtonHelper extends InteractionHelper<ButtonInteraction> {
    public constructor(cache: GuildCache, interaction: ButtonInteraction) {
        super(cache, interaction);
    }

    public async respond(content: string) {

    }

}
