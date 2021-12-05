import {
	EmojiIdentifierResolvable,
	GuildEmoji,
	GuildMember,
	Interaction,
	MessageActionRow,
	MessageButton,
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

	public forMainMenu() {
		const member = this.helper.interaction.member as GuildMember;

		return {
			embeds: [new MessageEmbed()
				.setAuthor(`Playlist options for ${member.user.tag}:`, member.user.avatarURL()!)
				.setColor("#FF4C4E")
				.setDescription("This is the configuration menu for your very own custom playlists!\n" +
					"Pick an option using the buttons to get started.")
				.addField(`> ${this.plus_emoji}  Add to Playlist`, `Add a track URL to an existing playlist.`)
				.addField(`> ${this.minus_emoji}  Remove from Playlist`, "Remove a track from an existing playlist.")
				.addField("> 🛠️  Create playlist", "Create an empty playlist with a specified name.")
				.addField(`> ${this.wastebasket_emoji}  Delete playlist`, "Delete a playlist with a specified name.")],

			components: [new MessageActionRow()
				.addComponents([
					new MessageButton()
						.setCustomId("playlist-add")
						.setLabel("Add")
						.setStyle("PRIMARY")
						.setEmoji(this.plus_emoji),
					new MessageButton()
						.setCustomId("playlist-remove")
						.setLabel("Remove")
						.setStyle("PRIMARY")
						.setEmoji(this.minus_emoji),
					new MessageButton()
						.setCustomId("playlist-create")
						.setLabel("Create")
						.setStyle("SUCCESS")
						.setEmoji("🛠️"),
					new MessageButton()
						.setCustomId("playlist-delete")
						.setLabel("Delete")
						.setStyle("DANGER")
						.setEmoji(this.wastebasket_emoji),
				])],
		} as WebhookEditMessageOptions;
	}

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
					.setPlaceholder(url ? `${url}` : `Select a playlist!`)])],
		} as WebhookEditMessageOptions;
	}
}
