import React from 'react';
import useForceUpdate from './useForceUpdate.js';
import {getState, subscribe, unsubscribe} from './store.js';

const useStoreState = (obj) => {
  subscribe(obj, useForceUpdate());

  React.useEffect(() => {
    return () => {
      unsubscribe(obj);
    };
  }, [obj]);

  return getState(obj.store);
}

export default useStoreState;
