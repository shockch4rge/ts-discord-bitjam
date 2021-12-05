import { Client, Guild, GuildChannel } from "discord.js";
import MusicService from "../services/MusicService";
import { ApiHelper } from "../helpers/ApiHelper";
import AfterEvery from "after-every";
import { firestore } from "firebase-admin";
import CollectionReference = firestore.CollectionReference;
import DocumentData = firestore.DocumentData;

export default class GuildCache {
	public readonly bot: Client;
	public readonly guild: Guild;
	public readonly userRefs: CollectionReference<DocumentData>;
	public readonly apiHelper: ApiHelper;
	public service?: MusicService;

	public constructor(bot: Client, guild: Guild, userRefs: CollectionReference<DocumentData>) {
		this.bot = bot;
		this.guild = guild;
		this.userRefs = userRefs;
		this.apiHelper = new ApiHelper();

		this.unNick();
	}

	public nick(name: string) {
		void this.guild.me!.setNickname(name);
	}

	public unNick() {
		void this.guild.me!.setNickname(null);
	}

	public getUserPlaylistRefs(userId: string) {
		return this.userRefs.doc(userId).collection("playlists");
	}

	public async createUserPlaylist(userId: string, name: string) {
		const playlistRefs = await this.getUserPlaylistRefs(userId).get();
		const playlistRef = this.getUserPlaylistRefs(userId).doc(name);

		if (!(await playlistRef.get()).exists) {
			await playlistRef.create({
				urls: []
			});
		}
	}

	/**
	 * Check every 5 minutes for members in the voice channel.
	 * If there are none, disconnect the bot.
	 * @param {string} channelId
	 * @returns {Promise<void>}
	 */
	public async affirmConnectionMinutely(channelId: string) {
		const interval = 2;
		let sessionMinutes = 0;

		const timer = AfterEvery(interval).minutes(async () => {
			const channel = this.guild.channels.cache.get(this.guild.me!.voice.channelId!) as GuildChannel | undefined;
			if (!channel) return;

			if (channel.isVoice()) {
				sessionMinutes += interval;

				if (channel.members.size === 1 && channel.members.get(this.guild.me!.id)) {
					await this.guild.me!.voice.disconnect();
					this.unNick();
					delete this.service;
					console.log(`Disconnected from the voice channel. Session time: ${sessionMinutes} minutes`);
					sessionMinutes = 0;
					timer();
				}

			}
		});
	}
}
