import {Receiver} from "./Receiver";
import {AudioService} from "../services/AudioService";
import {Message} from "discord.js";

export class PauseReceiver implements Receiver {
    public readonly callables: Function[];

    public constructor() {
        this.callables = [this.pause,]
    }

    public async pause(message: Message, service: AudioService) {
        service.pause();
    }
}