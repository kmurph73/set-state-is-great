import React from 'react';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
const subscribe = (store, key, id, forceUpdate) => {
    const componentMap = store.componentStore.get(key);
    if (componentMap) {
        componentMap.set(id, forceUpdate);
    }
    else {
        const componentMap = new Map();
        componentMap.set(id, forceUpdate);
        store.componentStore.set(key, componentMap);
    }
};
const unsubscribe = (store, key, id) => {
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
export const useStoreState = (store, key) => {
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
export const useNonNullState = (store, key) => {
    const forceUpdate = useForceUpdateIfMounted();
    const id = React.useId();
    React.useEffect(() => {
        subscribe(store, key, id, forceUpdate);
        return () => {
            unsubscribe(store, key, id);
        };
    }, [id, store, key, forceUpdate]);
    const value = store.state[key];
    if (value == null) {
        throw new Error(`value for ${key.toString()} is null/undefined, but shouldnt be!`);
    }
    return store.state[key];
};
