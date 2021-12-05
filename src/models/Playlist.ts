

export default class Playlist {
	public readonly name: string;
	public readonly trackUrls: string[];

	public constructor(data: PlaylistData) {
		this.name = data.name;
		this.trackUrls = data.trackUrls;
	}
}

export interface PlaylistData {
	name: string,
	trackUrls: string[],
}
