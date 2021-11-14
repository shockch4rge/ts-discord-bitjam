export class ArrayUtils {
    public static remove<T>(searchElement: T, from: T[]) {
        const index = from.indexOf(searchElement);

        if (index === -1) return;

        from.splice(index, 1);
    }

    public static sweep<T>(searchElement: T, from: T[]) {
        for (const i of from.keys()) {
            const index = from.indexOf(searchElement);

            if (index === -1) return;

            if (index === i) {
                from.splice(i, 1);
            }
        }
    }

    public static shuffle<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    public static clear<T>(array: T[]): void {
        void array.splice(0, array.length);
    }

    public static move<T>(searchElement: T, toIndex: number, array: T[]) {
        const index = array.indexOf(searchElement);

        if (index === -1) return;
        if (toIndex >= array.length) return;

        array.splice(index, 1);
        array.splice(toIndex, 0, searchElement)
    }
}
