import React from 'react';
import useForceUpdateIfMounted from './useForceUpdateIfMounted.js';
import {getState, getDynamicStateHelpers, subscribeDynamic, unsubscribeDynamic} from './store.js';

const useDynamicStoreState = (obj) => {
  subscribeDynamic(obj, useForceUpdateIfMounted());

  React.useEffect(() => {
    return () => {
      unsubscribeDynamic(obj.key, obj.store);
    };
  }, [obj.key, obj.store]);

  if (obj.getStateHelpers) {
    return getDynamicStateHelpers(obj);
  } else {
    return getState(obj.store);
  }
}

export default useDynamicStoreState;
