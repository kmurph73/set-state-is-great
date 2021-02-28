/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';
import Store from './store';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
import { SubscribeOpts } from './types';

let uniqueId = 1;
const getUniqueId = () => uniqueId++;

/**
 * access and observe changes to a store's state
 *
 * https://github.com/kmurph73/set-state-is-great#the-usestore-hook
 *
 * @example
 *
 * function Drawer() {
 *   const {open} = useStoreState(store, 'drawer', 'Drawer');
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
  opts?: SubscribeOpts,
): AppState[Key] => {
  const forceUpdate = useForceUpdateIfMounted();
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (idRef.current === 0) {
      idRef.current = getUniqueId();
    }

    store.subscribe(key, idRef.current, forceUpdate, opts);
    return (): void => {
      store.unsubscribe(key, idRef.current);
    };
  }, [store, key, forceUpdate, opts]);

  return store.getState(key);
};

export default useStoreState;
