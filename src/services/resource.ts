import { createAudioResource } from "@discordjs/voice";
import { MediaResource } from '../types'
import axios from "axios";
import ytdl from "ytdl-core";

const MP3_REGEX = /^https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$/i

export class MediaResourceFactory {
    public make(url: string) {
        if (MP3_REGEX.test(url)) { 
            axios.post(url)
            .then(() => { return new MP3Resource(url).create(); })
            .catch(() => { 
                console.log("ITS WRONG");
                return undefined; 
            });
        }

        if (ytdl.validateURL(url)) {
            return new YoutubeResource(url).create();
        }

        return undefined;
    }
}

export class MP3Resource implements MediaResource {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public create() {
        return createAudioResource(this.url);
    }
}

export class YoutubeResource implements MediaResource {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public create() {
        const stream = ytdl(this.url, { filter: 'audioonly' });
        return createAudioResource(stream);
    }
}