import React from 'react';
import Store from './store';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';

/**
 * access and observe changes to a store's state
 *
 * https://github.com/kmurph73/set-state-is-great#the-usestore-hook
 *
 * @example
 *
 * function Drawer() {
 *   const {open} = useStoreState(store, 'drawer');
 *   return (
 *     <MuiDrawer open={open}>
 *       <div>just drawer things</div>
 *     </MuiDrawer>
 *   )
 * }
 */
const useStoreState = <AppState, Key extends keyof AppState>(
  store: Store<AppState, Key>,
  key: Key,
  memoized: false,
) => {
  store.subscribe(key, useForceUpdateIfMounted(), memoized);

  React.useEffect(
    () => (): void => {
      store.unsubscribe(key);
    },
    [store, key],
  );

  return store.getState(key);
};

export default useStoreState;
