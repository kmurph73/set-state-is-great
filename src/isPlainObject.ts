import { PlainObject } from './types';

// https://stackoverflow.com/a/42028363/548170
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPlainObject(obj: any): obj is PlainObject {
  return (obj && obj.constructor === Object) || false;
}
