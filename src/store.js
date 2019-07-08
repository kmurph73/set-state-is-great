var state, storeObj;

const objStore = {};

export const subscribe = (obj, forceUpdate) => {
  if (objStore[obj.store].get(obj)) return;

  objStore[obj.store].set(obj, forceUpdate);
};

export const unsubscribe = (obj) => {
  objStore[obj.store].delete(obj);
};

const watchingAttrs = (changedAttrs, watchAttrs) => {
  for (let i = 0; i < changedAttrs.length; i++) {
    if (watchAttrs.includes(changedAttrs[i])) {
      return true;
    }
  }

  return false;
};

const setState = (store, nextState) => {
  const changedAttrs = [];

  const existingState = state[store];

  for (var attr in nextState) {
    if (existingState[attr] !== nextState[attr]) {
      existingState[attr] = nextState[attr];
      changedAttrs.push(attr);
    }
  }

  const forceUpdatesToCall = [];

  for (let [obj, forceUpdate] of objStore[store].entries()) {
    if ((!obj.watchAttrs) || watchingAttrs(changedAttrs, obj.watchAttrs)) {
      forceUpdatesToCall.push(forceUpdate);
    }
  }

  for(let i = 0; i < forceUpdatesToCall.length; i++) {
    forceUpdatesToCall[i]();
  }
};

export const getState = store => state[store];

const createSetState = store => state => {
  setState(store, state);
};

const createGetState = store => () => {
  return getState(store);
};

const forceUpdateViaName = (store, name) => {
  if (!store || !name) return;

  for (let [obj, forceUpdate] of objStore[store].entries()) {
    if (obj.name === name) {
      forceUpdate();
      return
    }
  }
};

export const createStore = (initialState) => {
  state = initialState;

  for (var store in initialState) {
    objStore[store] = new Map();
  }

  storeObj = { setState, getState, forceUpdateViaName };

  return storeObj;
};

export const getStateHelpers = (query) => {
  return {
    query: query,
    getState: createGetState(query.store),
    setState: createSetState(query.store)
  }
};
