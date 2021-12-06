import {
	EmojiIdentifierResolvable,
	GuildEmoji,
	GuildMember,
	Interaction,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
	MessageSelectOptionData,
	WebhookEditMessageOptions
} from "discord.js";
import { InteractionHelper } from "./InteractionHelper";

const config = require("../../config.json");

export class PlaylistMenuBuilder<I extends Interaction> {
	private readonly helper: InteractionHelper<I>;
	private readonly plus_emoji: GuildEmoji;
	private readonly minus_emoji: GuildEmoji;
	private readonly wastebasket_emoji: GuildEmoji;
	private readonly arrow_left_emoji: GuildEmoji;
	private readonly numbers: EmojiIdentifierResolvable[];

	public constructor(helper: InteractionHelper<I>) {
		this.helper = helper;
		this.plus_emoji = this.helper.cache.bot.emojis.cache.get(config.emojis.plus)!;
		this.minus_emoji = this.helper.cache.bot.emojis.cache.get(config.emojis.minus)!;
		this.wastebasket_emoji = this.helper.cache.bot.emojis.cache.get(config.emojis.wastebasket)!;
		this.arrow_left_emoji = this.helper.cache.bot.emojis.cache.get(config.emojis.arrow_left)!;
		this.numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
	}

	//TODO fix menuId/url being a dependency
	public forPlaylistSelect(playlistNames: string[], menuId: string, url?: string) {
		const member = this.helper.interaction.member as GuildMember;
		const menuRows: MessageSelectOptionData[] = [];

		if (playlistNames.length <= 0) {
			return {
				embeds: [new MessageEmbed()
					.setAuthor(`❌  You don't have any playlists!`)
					.setColor("RED")],
			} as WebhookEditMessageOptions;
		}

		for (let i = 0; i < playlistNames.length; i++) {
			menuRows.push({
				label: playlistNames[i],
				value: playlistNames[i],
				emoji: this.numbers[i],
			});
		}

		return {
			embeds: [new MessageEmbed()
				.setAuthor(`${member.user.username}'s playlists: `, member.user.avatarURL()!)
				.setDescription("Select a playlist in the dropdown below!")
				.setColor("GREYPLE")],

			components: [new MessageActionRow()
				.addComponents([new MessageSelectMenu()
					.setCustomId(menuId)
					.addOptions(menuRows)
					.setPlaceholder(url ?? `Select a playlist!`)])],
		} as WebhookEditMessageOptions;
	}
}
