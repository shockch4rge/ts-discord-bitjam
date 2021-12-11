export function delay(ms: number): Promise<unknown> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

export const TEXT = {
    EMOJIS: {
        NUMBERS: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"],

    },
    /**
     * this is not a whitespace, but rather a special empty
     * braille character, which bypasses discord's whitespace trimming.
     */
    EMPTY_SPACE: "⠀",
}

export function formatTime(ms: number): string {
    const min = Math.floor(ms / 1000 / 60);
    const sec = Math.floor(ms / 1000 % 60);

    return `${min}:${(sec < 10) ? "0" + sec : sec}`
}
