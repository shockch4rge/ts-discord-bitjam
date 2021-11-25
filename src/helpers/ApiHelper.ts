import ytdl from "ytdl-core";
import Song from "../models/Song";
import SpotifyWebApi from "spotify-web-api-node";
import { delay } from "../utilities/Utils";

const auth = require("../../auth.json");

export class ApiHelper {
    private readonly spotifyApi: SpotifyWebApi;
    private readonly youtubeMusicApi: any;
    private readonly geniusApi: any;

    public constructor() {
        this.spotifyApi = new SpotifyWebApi(auth.spotify);
        this.spotifyApi.setAccessToken(auth.spotify.accessToken);
        this.youtubeMusicApi = new (require("youtube-music-api"))();
        this.youtubeMusicApi.initalize();
        this.geniusApi = new (require("node-genius-api"))(auth.genius.accessToken);
    }

    public async getYoutubeSong(id: string, requester: string): Promise<Song> {
        let info = null;

        try {
            info = (await ytdl.getBasicInfo(id)).videoDetails;
        }
        catch {
            throw new Error(`Invalid link! No such video ID found: ${id}`);
        }

        return new Song({
            title: info.title,
            artist: info.author.name,
            url: `https://youtu.be/${info.videoId}`,
            cover: info.thumbnails[0].url,
            duration: +info.lengthSeconds * 1000,
            requester: requester,
        });
    }

    public async getSpotifySong(id: string, requester: string): Promise<Song> {
        await this.refreshSpotify();

        let track = null;

        try {
            track = (await this.spotifyApi.getTrack(id)).body;
        }
        catch {
            throw new Error(`Could not fetch the Spotify track. Check the URL?`);
        }

        // buffer time to initialise api
        await delay(1000);
        const result = (
            await this.youtubeMusicApi.search(`${track.name} ${track.artists[0].name}`, "song")
        ).content[0];

        return new Song({
            title: track.name,
            artist: track.artists.map(a => a.name).join(", "),
            url: `https://youtu.be/${result.videoId}`,
            cover: track.album.images[0].url,
            duration: Math.floor(track.duration_ms),
            requester: requester,
        });
    }

    public async getSpotifyAlbum(id: string, requester: string): Promise<Song[]> {
        await this.refreshSpotify();

        let album = null;

        try {
            album = (await this.spotifyApi.getAlbumTracks(id)).body.items;
        }
        catch (e) {
            // @ts-ignore
            throw new Error(`Invalid URL! ${e.message}`)
        }

        // map each track into a song
        const songs: Promise<Song>[] = album
            .map(track => this.getSpotifySong(track.id, requester));

        return Promise.all(songs);
    }

    public async getSpotifyPlaylist(id: string, requester: string): Promise<Song[]> {
        await this.refreshSpotify();

        let playlist = null;

        try {
            playlist = (await this.spotifyApi.getPlaylistTracks(id)).body.items;
        }
        catch (e) {
            // @ts-ignore
            throw new Error(`Invalid URL! ${e.message}`)
        }

        // map each track into a song
        const songs: Promise<Song>[] = playlist
            .map(track => track.track)
            .map(track => this.getSpotifySong(track.id, requester));

        return Promise.all(songs);
    }

    public async getGeniusLyrics(query: string): Promise<string> {
        const song = (await this.geniusApi.search(query))[0]?.result;

        if (!song) {
            throw new Error("");
        }

        const lyrics = (await this.geniusApi.lyrics(song.id)).slice(1) as {
            part: string;
            content: string[];
        }[]
        const lines: string[] = [];

        for (const lyric of lyrics) {
            lines.push(`\u200B`);
            lines.push(...lyric.content);
        }

        const lyricsString = lines.slice(1).join("\n");
        return lyricsString.slice(0, 6000);
    }

    public async refreshSpotify() {
        const response = (await this.spotifyApi.refreshAccessToken()).body;
        this.spotifyApi.setAccessToken(response.access_token);
        this.spotifyApi.setRefreshToken(response.refresh_token ?? auth.spotify.refreshToken)
    }

}
