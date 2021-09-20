import {Command} from "./Command";
import {AudioService} from "../services/AudioService";

export class PlayCommand implements Command {
    private readonly service: AudioService;

    public constructor(service: AudioService) {
        this.service = service;
    }

    public async execute(): Promise<void> {
        await this.service.play();
    }
}