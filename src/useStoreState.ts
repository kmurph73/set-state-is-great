import React from 'react';
import Store from './store';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';

const subscribe = <State, Key extends keyof State>(
  store: Store<State>,
  key: Key,
  id: string,
  forceUpdate: () => void,
): void => {
  const componentMap = store.componentStore.get(key);

  if (componentMap) {
    componentMap.set(id, forceUpdate);
  } else {
    const componentMap = new Map();
    componentMap.set(id, forceUpdate);
    store.componentStore.set(key, componentMap);
  }
};

const unsubscribe = <State, Key extends keyof State>(store: Store<State>, key: Key, id: string): void => {
  const obj = store.componentStore.get(key);

  if (obj) {
    obj.delete(id);
  }
};

/**
 * access and observe changes to a store's state
 *
 *  @param {Store} store - your SSiG Store object
 *  @param {Key} key - the key you'd like to subscribe to
 *
 * https://github.com/kmurph73/set-state-is-great#the-usestore-hook
 *
 * @example
 *
 * ``` jsx
 * function Drawer() {
 *   const { open } = useStoreState(store, 'drawer');
 *   return (
 *     <MuiDrawer open={open}>
 *       <div>just drawer things</div>
 *     </MuiDrawer>
 *   )
 * }
 * ```
 */
export const useStoreState = <State, Key extends keyof State>(store: Store<State>, key: Key): State[Key] => {
  const forceUpdate = useForceUpdateIfMounted();
  const id = React.useId();

  React.useEffect(() => {
    subscribe(store, key, id, forceUpdate);

    return (): void => {
      unsubscribe(store, key, id);
    };
  }, [id, store, key, forceUpdate]);

  return store.state[key];
};

/**
 * access and observe changes to a store's state
 *
 * checks that value is present and throws an error if not
 *
 * returning value is NonNull-ified (via TS's NonNullable utility type)
 *
 * https://www.typescriptlang.org/docs/handbook/utility-types.html#nonnullabletype
 *
 *  @param {Store} store - your SSiG Store object
 *  @param {Key} key - the key you'd like to subscribe to
 *
 * https://github.com/kmurph73/set-state-is-great#the-usestore-hook
 *
 * @example
 *
 * ``` jsx
 * function Drawer() {
 *   const { open } = useNonNullState(store, 'drawer');
 *   return (
 *     <MuiDrawer open={open}>
 *       <div>just drawer things</div>
 *     </MuiDrawer>
 *   )
 * }
 * ```
 */
export const useNonNullState = <State, Key extends keyof State>(
  store: Store<State>,
  key: Key,
): NonNullable<State[Key]> => {
  const forceUpdate = useForceUpdateIfMounted();
  const id = React.useId();

  React.useEffect(() => {
    subscribe(store, key, id, forceUpdate);

    return (): void => {
      unsubscribe(store, key, id);
    };
  }, [id, store, key, forceUpdate]);

  const value = store.state[key];

  if (!value) {
    throw new Error(`value for ${key.toString()} is null/undefined, but shouldnt be!`);
  }

  return store.state[key]!;
};
