import React, { useEffect, useRef } from 'react';

const useForceUpdateIfMounted = (): (() => void) => {
  // isMounted borrowed from https://github.com/jmlweb/isMounted
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return (): void => {
      isMounted.current = false;
    };
  }, []);

  // forceUpdate taken from: https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [_, forceUpdateIfMounted] = React.useReducer((x) => (isMounted.current ? x + 1 : x), 0);

  return forceUpdateIfMounted;
};

export default useForceUpdateIfMounted;
