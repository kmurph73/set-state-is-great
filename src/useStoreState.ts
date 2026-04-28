import { useCallback, useSyncExternalStore } from 'react';
import Store from './store';

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
  const subscribe = useCallback((onChange: () => void) => store.subscribe(key, onChange), [store, key]);
  const getSnapshot = useCallback(() => store.state[key], [store, key]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

/**
 * access and observe changes to a store's state
 *
 * checks that value is not null/undefined and throws an error if it is
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
  const value = useStoreState(store, key);

  if (value == null) {
    throw new Error(`value for ${key.toString()} is null/undefined, but shouldnt be!`);
  }

  return value!;
};
