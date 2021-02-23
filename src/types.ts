// React's TS signature for useReducer has a required argument
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts#L802
// however, our forceUpdate expects nothing to be passed in
// so, this is a hack to make passing in a value to useReducer optional
// HT: https://stackoverflow.com/a/44101728/548170
export type ForceUpdateIfMounted = Partial<React.Dispatch<unknown>> & ((value?: unknown) => void);

export type SubscribeProps = {
  name: string;
  memoized?: boolean;
};
