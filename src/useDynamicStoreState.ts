import React from 'react';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
import { PlainObject, DynamicQueryObject } from './types';
import { getState, subscribeDynamic, unsubscribeDynamic } from './store';

const useDynamicStoreState = (obj: DynamicQueryObject): PlainObject => {
  subscribeDynamic(obj, useForceUpdateIfMounted());

  React.useEffect(() => {
    return (): void => {
      unsubscribeDynamic(obj.key, obj.store);
    };
  }, [obj.key, obj.store]);

  return getState(obj.store);
};

export default useDynamicStoreState;
