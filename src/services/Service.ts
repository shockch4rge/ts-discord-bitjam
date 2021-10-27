export interface Service {
    suspendService: () => Promise<void>,
    resumeService: () => Promise<void>;
}