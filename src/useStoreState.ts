import React from 'react';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
import {QueryObject} from './types';
import {getState, subscribe, unsubscribe} from './store';

/**
 * access and observe changes to a store's state
 *
 * https://github.com/kmurph73/set-state-is-great#the-usestorestate-hook
 *
 * @example
 * import {useStoreState} from 'set-state-is-great';
 *
 * const query = {
 *   store: 'drawer',
 *   watchAttrs: ['open']
 * };
 * 
 * function Drawer() {
 *   const {open} = useStoreState(query);
 *   return (
 *     <MuiDrawer open={open}>
 *       <div>just drawer things</div>
 *     </MuiDrawer>
 *   )
 * }
 */
const useStoreState = (obj: QueryObject) => {
  subscribe(obj, useForceUpdateIfMounted());

  React.useEffect(() => {
    return () => {
      unsubscribe(obj);
    };
  }, [obj]);

  return getState(obj.store);
}

export default useStoreState;