import React from 'react';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
import { PlainObject, DynamicQueryObject, DynamicStateHelpers } from './types';
import { getState, subscribeDynamic, unsubscribeDynamic, getDynamicStateHelpers } from './store';

const useDynamicStoreState = (obj: DynamicQueryObject): PlainObject | DynamicStateHelpers => {
  subscribeDynamic(obj, useForceUpdateIfMounted());

  React.useEffect(() => {
    return (): void => {
      unsubscribeDynamic(obj.key, obj.store);
    };
  }, [obj.key, obj.store]);

  if (obj.getStateHelpers) {
    return getDynamicStateHelpers(obj);
  } else {
    return getState(obj.store);
  }
};

export default useDynamicStoreState;
