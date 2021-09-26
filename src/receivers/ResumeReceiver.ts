import {Receiver} from "./Receiver";
import {AudioService} from "../services/AudioService";
import {Message} from "discord.js";

export class ResumeReceiver implements Receiver {
    public readonly callables: Function[];

    public constructor() {
        this.callables = [
            this.resume,
        ];

    }

    public async resume(message: Message, service: AudioService) {
        service.resume();
    }
}