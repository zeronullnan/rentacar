export const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export function addDays(val: Date, days: number): Date {
    return new Date(val.getTime() + days * ONE_DAY_MS);
}

export function getDatesDiff(
    date1: string | number | Date,
    date2: string | number | Date,
): number {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);

    return dt1.getTime() - dt2.getTime();
}

export function getDaysDiff(
    date1: string | number | Date,
    date2: string | number | Date,
): number {
    const diff = getDatesDiff(date1, date2);

    if (isNaN(diff)) {
        return diff;
    }

    const days = Math.ceil(Math.abs(diff) / ONE_DAY_MS);

    return diff < 0 ? -days : days;
}

