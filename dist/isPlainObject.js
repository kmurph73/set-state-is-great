// https://stackoverflow.com/a/42028363/548170
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPlainObject(obj) {
    return (obj && obj.constructor === Object) || false;
}
