var state, storeObj;

const forceUpdatesStore = {};

const objHold = {};

export const subscribe = (obj, forceUpdate) => {
  const store = objHold[obj.store];
  if (store.includes(obj)) return;

  let slot = store.indexOf(null);

  if (slot >= 0) {
    store[slot] = obj;
  } else {
    store.push(obj);
    slot = store.length - 1;
  }

  const key = `${obj.store}-${slot}`;

  forceUpdatesStore[key] = forceUpdate;
};

export const unsubscribe = (obj) => {
  const slot = objHold[obj.store].indexOf(obj);
  const key = `${obj.store}-${slot}`;

  forceUpdatesStore[key] = objHold[obj.store][slot] = null;
};

const setState = (store, next_state) => {
  const changed_attrs = [];

  const existing_state = state[store];

  var attr;
  for (attr in next_state) {
    if (existing_state[attr] !== next_state[attr]) {
      existing_state[attr] = next_state[attr];
      changed_attrs.push(attr);
    }
  }

  const obj_arr = objHold[store];

  const forceUpdatesToCall = new Set();

  var slot, j, forceUpdate, obj, changed_attr, changed_attrs_length, obj_arr_length = obj_arr.length;

  for(slot = 0; slot < obj_arr_length; slot++)  {
    obj = obj_arr[slot];

    if (!obj) continue;

    if (!obj.watch_attrs) {
      forceUpdate = forceUpdatesStore[`${obj.store}-${slot}`];
      forceUpdatesToCall.add(forceUpdate);
      continue;
    }

    changed_attrs_length = changed_attrs.length;

    for(j = 0; j < changed_attrs_length; j++) {
      changed_attr = changed_attrs[j];

      if (obj.watch_attrs.includes(changed_attr)) {
        forceUpdate = forceUpdatesStore[`${obj.store}-${slot}`];
        forceUpdatesToCall.add(forceUpdate);
        break;
      }
    }
  }

  forceUpdatesToCall.forEach(fu => fu());
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

  const obj = objHold[store].find(obj => obj.name === name);

  if (obj) {
    const slot = objHold[store].indexOf(obj);

    const key = `${store}-${slot}`;

    forceUpdatesStore[key]();
  }
};

export const createStore = (initialState) => {
  const keys = Object.keys(initialState);

  state = initialState;

  keys.forEach(k => objHold[k] = []);

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
