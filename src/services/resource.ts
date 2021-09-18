import { AudioResource, createAudioResource } from "@discordjs/voice";
import { MediaResource, MediaResourceValidator, MediaType } from '../types'
import SpotifyWebApi from "spotify-web-api-node"
import axios from "axios";
import ytdl from "ytdl-core";


export class MediaResourceProcessor {
    // public async convert(url: string) {
    //     if (await new MP3Validator(url).validate()) {
    //         return await new MP3Resource(url).create();
    //     }

    //     if (await new YoutubeValidator(url).validate()) {
    //         return await new MP3Resource(url).create()
    //     }

    //     return undefined;
    // }

    // public convert(url: string, validator: MediaResourceValidator) {
    //     if (validator instanceof MP3Validator) {
    //         return new MP3Resource(url, validator).create();
    //     }

    //     if (validator instanceof YoutubeValidator) {
    //         return new YoutubeResource(url, validator).create();
    //     }

    //     return undefined;
    // }

    public async convert(url: string, processor: ResourceProcessor) {
        if (await processor.validate(url)) {
            return await processor.create(url);
        }
        
        return undefined;
    }
}

export abstract class ResourceProcessor {
    public abstract validate(url: string): Promise<boolean>;
    public abstract create(url: string): Promise<AudioResource>;
}

export class MP3Processor extends ResourceProcessor {
    public async validate(url: string): Promise<boolean> {
        const MP3_REGEX = /^https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$/i

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

    public async create(url: string): Promise<AudioResource> {
        return createAudioResource(url);
    }
}

export class YoutubeProcessor extends ResourceProcessor {
    public async validate(url: string): Promise<boolean> {
        return ytdl.validateURL(url);
    }

    public async create(url: string): Promise<AudioResource> {
        const stream = ytdl(url, { filter: 'audioonly' });
        return createAudioResource(stream);
    }
}

// class MP3Resource implements MediaResource {
//     private readonly url: string;
//     private readonly validator: MP3Validator;

//     public constructor(url: string, validator: MP3Validator) {
//         this.url = url;
//         this.validator = validator;
//     }

//     public create() {
//         if (this.validator.validate(this.url)) {
//             return createAudioResource(this.url);
//         }
//     }
    
// }

// class YoutubeResource implements MediaResource {
//     private readonly url: string;
//     private readonly validator: YoutubeValidator;

//     public constructor(url: string, validator: YoutubeValidator) {
//         this.url = url;
//         this.validator = validator;
//     }

//     public create() {
//         if (this.validator.validate(this.url)) {
            // const stream = ytdl(this.url, { filter: 'audioonly' });
//             return createAudioResource(stream);
//         }
//     }
// }

// class MP3Resource implements MediaResource {
//     private readonly url: string;

//     public constructor(url: string) {
//         this.url = url;
//     }

//     public async create(): Promise<AudioResource> {
//         return createAudioResource(this.url);
//     }
// }

// class YoutubeResource implements MediaResource {
//     private readonly url: string;

//     public constructor(url: string) {
//         this.url = url;
//     }

//     public async create(): Promise<AudioResource> {
//         const stream = ytdl(this.url, { filter: 'audioonly' });
//         return createAudioResource(stream);
//     }
// }

export class MP3Validator implements MediaResourceValidator {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    public async validate(): Promise<boolean> {
        const MP3_REGEX = /^https?:\/\/[a-z0-9_@\.\/\-]+\.mp3$/i

        if (MP3_REGEX.test(this.url)) {
            try {
                await axios.post(this.url);
                return true;
            }
            catch {
                return false;
            }
        }

        return false;
    }
}

export class YoutubeValidator implements MediaResourceValidator {
    private readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }
    
    public async validate(): Promise<boolean> {
        return ytdl.validateURL(this.url);
    }
}