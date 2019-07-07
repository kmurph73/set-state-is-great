import React from 'react';
import useForceUpdate from 'use-force-update';
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
