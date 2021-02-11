export const showUTCDate = (date: Date): string => {
    return date
        .toUTCString()
        .split(" ")
        .slice(0, 4)
        .join(" ");
};