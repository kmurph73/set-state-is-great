import React, {useEffect, useRef} from 'react';

 const useForceUpdateIfMounted = () => {
  // isMounted code borrowed from https://github.com/jmlweb/isMounted
  const isMounted = useRef(false);

   useEffect(() => {
    isMounted.current = true;
    return () => isMounted.current = false;
  }, []);

  // forceUpdate code taken from: https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  // eslint-disable-next-line no-unused-vars
  const [_, forceUpdateIfMounted] = React.useReducer(x => (
    isMounted.current ? x + 1 : x
  ), 0);

  return forceUpdateIfMounted;
};

export default useForceUpdateIfMounted;
