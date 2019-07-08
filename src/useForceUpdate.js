import React from 'react';

// taken from: https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
const useForceUpdate = () => {
  // eslint-disable-next-line no-unused-vars
  const [_, forceUpdate] = React.useReducer(x => x + 1, 0);

  return forceUpdate;
};

export default useForceUpdate;
