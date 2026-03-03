export function omitFields<T>(obj: T, fieldsToOmit: (keyof T)[]): Partial<T> {
    const copy = { ...obj };
    fieldsToOmit.forEach((field) => delete copy[field]);
    return copy;
}
