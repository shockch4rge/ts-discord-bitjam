export function delay(ms: number): Promise<unknown> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

export function formatTime(ms: number): string {
    const min = Math.floor(ms / 1000 / 60);
    const sec = Math.floor(ms / 1000 % 60);

    return `${min}:${(sec < 10) ? "0" + sec : sec}`
}
