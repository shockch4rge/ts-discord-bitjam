import { Interaction } from "discord.js";
import GuildCache from "../db/GuildCache";

export abstract class InteractionHelper<I extends Interaction> {
    public readonly cache: GuildCache;
    public readonly interaction: I

    protected constructor(cache: GuildCache, interaction: I) {
        this.cache = cache;
        this.interaction = interaction;
    }

    public abstract respond(content: string): Promise<void>;
}
