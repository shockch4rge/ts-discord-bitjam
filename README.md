# Yet Another Discord Music Bot
I love using Discord, so why not make another generic music bot for personal use? I got really interested in the way the other bots out there handled commands, queries, and all sorts of interactions, so I got to researching and creating my own.

## Description
A pet project coded in my free time using TypeScript. Uses ts-node as runtime and the discord.js v13 API for Discord v9. Integrates slash commands. User playlists are saved in Firebase.

This was originally written in JavaScript, but I got really fed up with loose typing (coming from a Java background). This project was then [migrated over from JavaScript].

## Main Libraries
- [`discord.js`]
- [`@discordjs/voice`]
- [`@discordjs/builders`]
- [`@discordjs/rest`]
- [`@discordjs/opus`]
- [`axios`]
- [`ytdl-core`]
- [`youtube-music-api`]
- [`youtube-dl-exec`]
- [`spotify-web-api-node`]
- [`firebase-admin`]
- [`ts-node`]
- [`express`]

# Features
- Play Youtube URLs, Spotify songs/albums/playlists or search YouTube with queries (in one command!)
- Loop, remove songs, swap songs, replace songs (all that jazz!)
- Adjustable audio quality (tested by an audiophile but no guaranteed change in quality!)
- Create, play and delete your own playlists - max 25 (admittedly useless but cool!)

# Notes
Creating a track's audio resource can be extremely buggy when working with ytdl-core or ytdl. Most of the time, the track cuts out halfway and throws an error. This has been a known issue on ytdl's part and discordjs came up with a solution.

Here's an extract from a music bot example that they [thankfully provided on GitHub]:
```ts

export default class Track {
    /**
     * Creates an AudioResource from this Track.
     */
    public createAudioResource(): Promise<AudioResource<Track>> {
        return new Promise((resolve, reject) => {
            const process = ytdl(
                this.url,
                {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '100K',
                },
                { stdio: ['ignore', 'pipe', 'ignore'] },
            );
            if (!process.stdout) {
                reject(new Error('No stdout'));
                return;
            }
            const stream = process.stdout;
            const onError = (error: Error) => {
                if (!process.killed) process.kill();
                stream.resume();
                reject(error);
            };
            process
                .once('spawn', () => {
                    demuxProbe(stream)
                        .then(probe => resolve(createAudioResource(probe.stream, {
                            metadata: this,
                            inputType: probe.type
                        })))
                        .catch(onError);
                })
                .catch(onError);
        });
    }
}
```

From what I know, audio quality is significantly improved and the midway crashing is gone, so I greatly recommend using this.

[migrated over from JavaScript]: https://github.com/Shockch4rge/js-discord-bitjam
[`discord.js`]: https://www.npmjs.com/package/discord.js
[`@discordjs/voice`]: https://www.npmjs.com/package/@discordjs/voice
[`@discordjs/builders`]: https://www.npmjs.com/package/@discordjs/builders
[`ts-node`]: https://www.npmjs.com/package/ts-node
[`ytdl-core`]: https://www.npmjs.com/package/ytdl-core
[thankfully provided on GitHub]: https://github.com/discordjs/voice/tree/3dabc30fca79212809d1191e0c2f2b54c3f8cdc7/examples/music-bot
