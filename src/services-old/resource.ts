import { AudioResource, createAudioResource } from "@discordjs/voice";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "../auth.json";
import SpotifyWebApi from "spotify-web-api-node"
import axios from "axios";
import ytdl from "ytdl-core";


export class AudioResourceProcessor {
    public async process(url: string) {
        if (await Validator.validateMP3(url)) {
            return new MP3Resource(url).create();
        }

        if (await Validator.validateYoutube(url)) {
            return new YoutubeResource(url).create();
        }

        if (await Validator.validateSpotify(url)) {
            return new SpotifyResource(url).create();
        }

        return undefined;
    }
}

class Validator {
    public static async validateMP3(url: string) {
        const MP3_REGEX = /^https?:\/\/[a-zA-Z0-9_@\.\/\-]+\.mp3$/

        if (MP3_REGEX.test(url)) {
            try {
                await axios.post(url);
                return true;
            }
            catch {
                return false;
            }
        }
        return false;
    }

    public static async validateYoutube(url: string): Promise<boolean> {
        return ytdl.validateURL(url);
    }

    public static async validateSpotify(url: string): Promise<boolean> {
       const SPOTIFY_REGEX = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?track(?::|\/)((?:[0-9a-zA-Z]){22})$/
       
       if (SPOTIFY_REGEX.test(url)) {
           try {
               await axios.post(url);
               return true;
           }
           catch {
               return false;
           }
       }
       return false;
    }
}

class MP3Resource implements MediaResource {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public async create(): Promise<AudioResource> {
        return createAudioResource(this.url);
    }
}

class YoutubeResource implements MediaResource {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public async create(): Promise<AudioResource> {
        const stream = ytdl(this.url, { filter: 'audioonly' });
        return createAudioResource(stream);
    }
}

class SpotifyResource implements MediaResource {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public async create(): Promise<AudioResource> {
        const spotify = new SpotifyWebApi({ clientId: SPOTIFY_CLIENT_ID, clientSecret: SPOTIFY_CLIENT_SECRET });
        const matched = this.url.match(/^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?track(?::|\/)((?:[0-9a-zA-Z]){22})/);
        const trackId = matched![1];

        //s
        const track = await spotify.getTrack(trackId, { market: "SG" });
        return createAudioResource(this.url);
    }
}

type MediaResource = {
    create: () => Promise<AudioResource>,
}