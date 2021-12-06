import { Client, Guild, GuildChannel } from "discord.js";
import MusicService from "../services/MusicService";
import { ApiHelper } from "../helpers/ApiHelper";
import AfterEvery from "after-every";
import { firestore } from "firebase-admin";
import Playlist from "../models/Playlist";
import CollectionReference = firestore.CollectionReference;
import DocumentData = firestore.DocumentData;
import FieldValue = firestore.FieldValue;

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

		this.resetBot();
	}

	// leave empty voice channels, un-nick
	private resetBot() {
		this.unNick();
		if (this.guild.me!.voice.channel && this.guild.me!.voice.channel.members.size === 1) {
			void this.guild.me!.voice.disconnect();
		}
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

	public async getUserPlaylist(userId: string, name: string) {
		const playlistRef = this.getUserPlaylistRefs(userId).doc(name);
		const snap = await playlistRef.get();

		return new Playlist({
			name: snap.id,
			trackUrls: snap.get("urls") as string[],
		})
	}

	public async addUrlToUserPlaylist(url: string, name: string, userId: string) {
		const playlistRef = this.getUserPlaylistRefs(userId).doc(name);
		const snap = await playlistRef.get();

		if (snap.exists) {
			await playlistRef.update({
				urls: FieldValue.arrayUnion(url),
			})
		}
	}

	public async createUserPlaylist(userId: string, name: string) {
		const playlistRef = this.getUserPlaylistRefs(userId).doc(name);
		const snap = await playlistRef.get();

		if (!snap.exists) {
			await playlistRef.create({
				urls: [],
			});
		}
		else {
			throw new Error("A playlist already exists with the same name!");
		}
	}

	public async deleteUserPlaylist(userId: string, name: string) {
		const playlistRef = this.getUserPlaylistRefs(userId).doc(name);
		const snap = await playlistRef.get();

		if (snap.exists) {
			await playlistRef.delete();
		}
		else {
			throw new Error("That playlist doesn't exist!");
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
