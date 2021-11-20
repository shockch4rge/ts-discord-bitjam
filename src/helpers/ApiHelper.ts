import ytdl from "ytdl-core";
import Song from "../models/Song";
import SpotifyWebApi from "spotify-web-api-node";

const auth = require("../../auth.json");

export class ApiHelper {
    private readonly spotifyApi: SpotifyWebApi;

    public constructor() {
        this.spotifyApi = new SpotifyWebApi(auth.spotify);
        this.spotifyApi.setAccessToken(auth.spotify.accessToken);
    }

    public async getYoutubeSong(url: string, requester: string) {
        if (ytdl.validateURL(url)) {
            const info = (await ytdl.getBasicInfo(url)).videoDetails;

            return new Song({
                url: info.video_url,
                artist: info.author.name,
                title: info.title,
                cover: info.thumbnails[0].url,
                duration: +info.lengthSeconds * 1000,
                requester: requester,
            });
        }
    }

    public async getSpotifySong(id: string, requester: string) {
        await this.refreshSpotify();
        const track = (await this.spotifyApi.getTrack(id)).body;

        return new Song({
            title: track.name,
            artist: track.artists.map(artist => artist.name).join(", "),
            cover: track.album.images[0].url,
            url: `https://open.spotify.com/track/${id}`,
            duration: track.duration_ms,
            requester: requester,
        });
    }

    public async getSpotifyPlaylist(id: string, requester: string): Promise<Song[]> {
        await this.refreshSpotify();

        const playlist = (await this.spotifyApi.getPlaylistTracks(id)).body.items;

        // map tracks into songs
        return playlist
            .map(track => track.track)
            .filter(track => !track)
            .map(track => new Song({
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(", "),
                cover: track.album.images[0].url,
                duration: track.duration_ms,
                requester: requester,
                url: `https://open.spotify.com/track/${track.id}`
            }));
    }

    public async refreshSpotify() {
        const response = (await this.spotifyApi.refreshAccessToken()).body;
        this.spotifyApi.setAccessToken(response.access_token);
        this.spotifyApi.setRefreshToken(response.refresh_token ?? auth.spotify.refreshToken)
    }

}
