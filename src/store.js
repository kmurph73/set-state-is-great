var state, storeObj;

const objStore = {};

export const subscribe = (obj, forceUpdate) => {
  if (objStore[obj.store].get(obj)) return;

  objStore[obj.store].set(obj, forceUpdate);
};

export const unsubscribe = (obj) => {
  objStore[obj.store].delete(obj);
};

const watchingChanges = (changed_attrs, watch_attrs) => {
  for (let i = 0; i < changed_attrs.length; i++) {
    if (watch_attrs.includes(changed_attrs[i])) {
      return true;
    }
  }

  return false;
};

const setState = (store, next_state) => {
  const changed_attrs = [];

  const existing_state = state[store];

  for (var attr in next_state) {
    if (existing_state[attr] !== next_state[attr]) {
      existing_state[attr] = next_state[attr];
      changed_attrs.push(attr);
    }
  }

  const forceUpdatesToCall = [];

  for (let [obj, forceUpdate] of objStore[store].entries()) {
    if ((!obj.watch_attrs) || watchingChanges(changed_attrs, obj.watch_attrs)) {
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
