/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
const unsubscribe = (store, key, id) => {
    const obj = store.componentStore.get(key);
    if (obj) {
        obj.delete(id);
    }
};
const subscribe = (store, key, id, forceUpdate) => {
    const forceUpdatekeyMap = store.componentStore.get(key);
    if (!forceUpdatekeyMap) {
        const componentMap = new Map();
        componentMap.set(id, forceUpdate);
        store.componentStore.set(key, componentMap);
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
const useStoreState = (store, key) => {
    const forceUpdate = useForceUpdateIfMounted();
    const id = React.useId();
    React.useEffect(() => {
        subscribe(store, key, id, forceUpdate);
        return () => {
            unsubscribe(store, key, id);
        };
    }, [id, store, key, forceUpdate]);
    return store.state[key];
};
export default useStoreState;
