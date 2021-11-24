import ytdl from "ytdl-core";
import Song from "../models/Song";
import SpotifyWebApi from "spotify-web-api-node";

const auth = require("../../auth.json");

export class ApiHelper {
    private readonly spotifyApi: SpotifyWebApi;
    private readonly youtubeMusicApi: any;

    public constructor() {
        this.spotifyApi = new SpotifyWebApi(auth.spotify);
        this.spotifyApi.setAccessToken(auth.spotify.accessToken);
        this.youtubeMusicApi = new (require("youtube-music-api"))();
        this.youtubeMusicApi.initalize();
    }

    public async getYoutubeSong(id: string, requester: string) {
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

    public async getSpotifySong(id: string, requester: string) {
        await this.refreshSpotify();

        let track = null;

        try {
            track = (await this.spotifyApi.getTrack(id)).body;
        }
        catch {
            throw new Error(`Could not fetch the Spotify track. Check the URL?`);
        }

        const results = await this.youtubeMusicApi.search(`${track.name} ${track.artists[0]}`, "SONG");

        return new Song({
            title: track.name,
            artist: track.artists.map(a => a.name).join(", "),
            url: `https://open.spotify.com/track/${track.id}`,
            cover: track.album.images[0].url,
            duration: Math.floor(track.duration_ms),
            requester: requester,
        })
    }

    public async getSpotifyPlaylist(id: string, requester: string): Promise<Song[]> {
        await this.refreshSpotify();

        let playlist = null

        try {
            playlist = (await this.spotifyApi.getPlaylistTracks(id)).body.items;
        }
        catch (e) {
            // @ts-ignore
            throw new Error(`Invalid URL! ${e.message}`)
        }

        // map playlist tracks into songs
        return playlist
            .map(track => track.track)
            .filter(track => !track)
            .map(track => new Song({
                title: track.name,
                artist: track.artists.map(a => a.name).join(", "),
                url: `https://open.spotify.com/track/${track.id}`,
                cover: track.album.images[0].url,
                duration: track.duration_ms,
                requester: requester,
            }));
    }

    public async refreshSpotify() {
        const response = (await this.spotifyApi.refreshAccessToken()).body;
        this.spotifyApi.setAccessToken(response.access_token);
        this.spotifyApi.setRefreshToken(response.refresh_token ?? auth.spotify.refreshToken)
    }

}
