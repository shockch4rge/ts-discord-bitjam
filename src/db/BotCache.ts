import GuildCache from "./GuildCache";
import { Client, Collection, Guild } from "discord.js";
import admin, { firestore } from "firebase-admin";
import CollectionReference = firestore.CollectionReference;
import DocumentData = firestore.DocumentData;

const auth = require("../../config.json");

export default class BotCache {
    private readonly db: FirebaseFirestore.Firestore;
    public readonly bot: Client;
    public readonly guildCaches: Collection<string, GuildCache>;
    public readonly guildRefs: CollectionReference<DocumentData>;
    public readonly userRefs: CollectionReference<DocumentData>;

    public constructor(bot: Client) {
        // init db
        admin.initializeApp({ credential: admin.credential.cert(auth.firebase.service_account) });
        this.db = admin.firestore();

        this.bot = bot;
        this.guildCaches = new Collection<string, GuildCache>();
        this.guildRefs = this.db.collection(auth.firebase.collection.guilds);
        this.userRefs = this.db.collection(auth.firebase.collection.users);
    }

    public async getGuildCache(guild: Guild) {
        let cache = this.guildCaches.get(guild.id);

        if (!cache) {
            cache = await this.createGuildCache(guild);
        }

        return cache;
    }

    public async createGuildCache(guild: Guild) {
        const guildRef = this.guildRefs.doc(guild.id);
        const snap = await guildRef.get();

        if (!snap.exists) {
            await guildRef.create({});
        }

        const cache = new GuildCache(this.bot, guild, this.userRefs);
        this.guildCaches.set(guild.id, cache);
        return cache;
    }

    public async deleteGuildCache(guildId: string) {
        const doc = await this.guildRefs.doc(guildId).get();
        if (doc.exists) {
            await this.guildRefs.doc(guildId).delete();
        }
        this.guildCaches.delete(guildId);

    }

}
