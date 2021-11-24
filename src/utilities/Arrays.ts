export class Arrays {
    /**
     * Removes an element from an array. This method modifies the array.
     *
     * @param {T} searchElement The element to remove
     * @param {T[]} from The element source
     */
    public static remove<T>(searchElement: T, from: T[]) {
        const index = from.indexOf(searchElement);

        if (index === -1) return;

        from.splice(index, 1);
    }

    /**
     * Remove all instances of a specific element from an array. This method modifies the array.
     * @param {T} searchElement The element to remove
     * @param {T[]} from The element source
     */
    public static sweep<T>(searchElement: T, from: T[]) {
        for (let i = 0; i < from.length; i++) {
            const index = from.indexOf(searchElement);

            if (index === -1) return;

            if (index === i) {
                from.splice(i, 1);
            }
        }
    }

    /**
     * Shuffle an array randomly. This method modifies the array.
     * @param {T[]} array The array to shuffle
     * @returns {T[]} The shuffled array.
     */
    public static shuffle<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    /**
     * Clear an array completely. This method modifies the array.
     * @param {T[]} array The array to clear
     */
    public static clear<T>(array: T[]): void {
        void array.splice(0);
    }

    /**
     * Swap an element with another one in an array. Doesn't do anything if the elements are not found.
     * @param searchIndex
     * @param {T} _with The element to swap with
     * @param {T[]} array The array to modify
     */
    public static swap<T>(searchIndex: number, _with: T, array: T[]): void {
        if (searchIndex < 0 || searchIndex >= array.length) return;

        const withIndex = array.indexOf(_with);

        if (withIndex === -1) return;

        const searchElement = array[searchIndex];

        void array.splice(searchIndex,  1, _with);
        void array.splice(withIndex, 1, searchElement)
    }

    /**
     * Replace an element with a specified one in an array. Doesn't do anything if the specified one is not found.
     * @param searchIndex The index to replace
     * @param {T} _with The element to swap with
     * @param {T[]} array The array to modify
     */
    public static replace<T>(searchIndex: number, _with: T, array: T[]): void {
        array.splice(searchIndex, 1, _with);
    }

    public static move<T>(fromIndex: number, toIndex: number, array: T[]) {
        const removed = array.splice(fromIndex, 1)[0];
        void array.splice(toIndex, 0, removed)
    }

    public static shiftAndPush<T>(array: T[]) {
        if (array.length === 0) return;
        const element = array.shift()!;
        array.push(element);
    }
}
