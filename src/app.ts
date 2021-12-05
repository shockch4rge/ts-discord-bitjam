import { Client, Intents } from "discord.js";
import express from "express";
import open from "open";
import BotHelper from "./helpers/BotHelper";
import axios from "axios";
import qs from "qs";
import fs from "fs/promises";
import path from "path";

const config = require("../config.json")


const start = () => {
    const PORT = 4296;
    const app = express();

    app.get("/", async (req, res) => {
        console.log(`Got Spotify API Authorization token`)
        const code = req.query.code as string;

        // Login to Spotify and receive access and refresh token
        const spotify_res = await axios.post(
            "https://accounts.spotify.com/api/token",
            qs.stringify({
                grant_type: "authorization_code",
                code,
                redirect_uri: "http://localhost:4296"
            }),
            {
                headers: {
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            config.spotify.clientId + ":" + config.spotify.clientSecret
                        ).toString("base64"),
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        // Replace old access token with new access token
        const config_path = path.join(__dirname, "../config.json")
        const config_data = await fs.readFile(config_path, "utf8")
        await fs.writeFile(
            config_path,
            config_data
                .replace(config.spotify.accessToken, spotify_res.data.access_token)
                .replace(config.spotify.refreshToken, spotify_res.data.refresh_token)
        )
        console.log(`Replaced Spotify API Access token`)

        res.send("<script>window.close();</script>")
        server.close()

        const startBot = () => {
            const bot = new Client({
                intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
            });

            const botHelper = new BotHelper(bot)
            botHelper.setup();

            void bot.login(config.bot_token);
        }

        startBot();
    });

    const server = app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);

        // Get spotify authorization code
        const spotify_url = new URL("https://accounts.spotify.com/authorize");
        spotify_url.searchParams.append("response_type", "code");
        spotify_url.searchParams.append("client_id", config.spotify.clientId);
        spotify_url.searchParams.append("redirect_uri", "http://localhost:4296");
        spotify_url.searchParams.append("scope", "user-read-private playlist-read-private");
        await open(spotify_url.href, { wait: true });
    });
}



start();
