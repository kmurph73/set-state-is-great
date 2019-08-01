var state, storeObj;

const objStore = {};

export const subscribe = (obj, forceUpdate) => {
  objStore[obj.store].set(obj, forceUpdate);
};

export const subscribeDynamic = (obj, forceUpdate) => {
  if (obj.key) {
    objStore[obj.store].set(obj.key, {obj, forceUpdate});
  } else {
    throw new Error("Must pass in a key attr to useDynamicStoreState!");
  }
};

export const unsubscribe = (obj) => {
  objStore[obj.store].delete(obj);
};

export const unsubscribeDynamic = (key, store) => {
  objStore[store].delete(key);
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
  var forceUpdate, obj;

  for (let [key, value] of objStore[store].entries()) {
    if (typeof(key) === 'string') {
      obj = value.obj;
      forceUpdate = value.forceUpdate;
    } else {
      obj = key;
      forceUpdate = value;
    }

    if ((!obj.watchAttrs) || watchingAttrs(changedAttrs, obj.watchAttrs)) {
      forceUpdatesToCall.push(forceUpdate);
    }
  }

  const len = forceUpdatesToCall.length;
  for(let i = 0; i < len; i++) {
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
  for (let [obj, forceUpdate] of objStore[store].entries()) {
    if (obj.name === name) {
      forceUpdate();
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

export const getDynamicStateHelpers = (query) => {
  return {
    state: getState(query.store),
    getState: createGetState(query.store),
    setState: createSetState(query.store)
  }
};
