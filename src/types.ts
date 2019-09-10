export interface queryObject {
  store: string;
  watchAttrs: Array<string> | null;
  name?: string;
}

export interface stateObj {
  [s: string]: plainObject; 
}

export interface plainObject {
  [s: string]: any
}

// React's TS signature for useReducer requires a variable be passed in
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts#L802
// however, our forceUpdate expects nothing to be passed in
// so, this is a hack to make passing in a value to useReducer optional
// HT: https://stackoverflow.com/a/44101728/548170
export type forceUpdateIfMounted = Partial<React.Dispatch<unknown>> & ((value?: any) => void);