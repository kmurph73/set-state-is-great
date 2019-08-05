import React from 'react';
import useForceUpdateIfMounted from './useForceUpdateIfMounted.js';
import {getState, subscribe, unsubscribe} from './store.js';

const useStoreState = (obj) => {
  subscribe(obj, useForceUpdateIfMounted());

  React.useEffect(() => {
    return () => {
      unsubscribe(obj);
    };
  }, [obj]);

  return getState(obj.store);
}

export default useStoreState;
