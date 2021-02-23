/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';
import Store from './store';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
import { SubscribeOpts } from './types';

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
  store: Store<AppState>,
  key: Key,
  componentName: string,
  opts: SubscribeOpts,
): AppState[Key] => {
  store.subscribe(key, componentName, useForceUpdateIfMounted(), opts);

  React.useEffect(
    () => (): void => {
      store.unsubscribe(key, componentName);
    },
    [store, key, componentName],
  );

  return store.getState(key);
};

export default useStoreState;
