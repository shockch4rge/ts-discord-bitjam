import {Receiver} from "./Receiver";
import {AudioService} from "../services/AudioService";
import {Message} from "discord.js";

export class PlayReceiver implements Receiver {
    public readonly callables: Function[];

    public constructor() {
        this.callables = [this.startPlaying,]
    }

    public async startPlaying(message: Message, service: AudioService) {
        await service.play();
    }
}