import { createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";
import { Resource } from '../types'

export class ResourceFactory {
    public make(url: string) {
        if (/^https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$/i.test(url)) {
            return new MP3Resource(url).create();
        }

        if (ytdl.validateURL(url)) {
            return new YoutubeResource(url).create();
        }

        return undefined;
    }
}

export class MP3Resource implements Resource {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public create() {
        return createAudioResource(this.url);
    }
}

export class YoutubeResource implements Resource {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public create() {
        const stream = ytdl(this.url, { filter: 'audioonly' });
        return createAudioResource(stream);
    }
}