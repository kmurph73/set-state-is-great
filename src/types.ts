export interface QueryObject {
  store: string;
  watchAttrs?: Array<string> | null;
  name?: string;
}

export interface DynamicQueryObject {
  store: string;
  key: string;
  watchAttrs?: Array<string> | null;
  name?: string;
}

export interface StateObj {
  [s: string]: PlainObject;
}

export interface PlainObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [s: string]: any;
}

export interface StateHelpers {
  query: QueryObject;
  getState: () => PlainObject;
  setState: (state: PlainObject) => void;
  assignState: (state: PlainObject) => void;
}

export interface Store {
  getFullState: (store: string) => StateObj;
  setState: (store: string, nextState: PlainObject) => void;
  getState: (store: string) => PlainObject;
  assignState: (store: string, nextState: PlainObject) => void;
  forceUpdateViaName: (store: string, name: string) => void;
}

// React's TS signature for useReducer requires a variable be passed in
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts#L802
// however, our forceUpdate expects nothing to be passed in
// so, this is a hack to make passing in a value to useReducer optional
// HT: https://stackoverflow.com/a/44101728/548170
export type ForceUpdateIfMounted = Partial<React.Dispatch<unknown>> & ((value?: unknown) => void);
