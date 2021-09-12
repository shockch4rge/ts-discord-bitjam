import { AudioResource, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";

export class ResourceFactory {
    public make(resource: Resource) {
        return resource.createResource();
    }
}

export class MP3Resource implements Resource {
    url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public validate() {
        return /^https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$/i.test(this.url);
    }

    public createResource() {
        if (!this.validate()) {
            return undefined;
        }
        return createAudioResource(this.url);
    }
}

export class YoutubeResource implements Resource {
    url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public validate() {
        return ytdl.validateURL(this.url);
    }

    public createResource() {
        if (!this.validate()) {
            return undefined;
        }

        let stream = ytdl(this.url, { filter: 'audioonly' });
        return createAudioResource(stream);
    }
}

interface Resource {
    validate: () => boolean;
    createResource: () => AudioResource | undefined;
}