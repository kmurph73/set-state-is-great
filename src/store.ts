import {StateObj, ForceUpdateIfMounted, QueryObject, PlainObject} from '../index';

var state: StateObj;

interface ObjStore {
  [s: string]: Map<QueryObject, ForceUpdateIfMounted>; 
}

const objStore: ObjStore = {};

export const subscribe = (obj: QueryObject, forceUpdate: ForceUpdateIfMounted) => {
  objStore[obj.store].set(obj, forceUpdate);
};

export const unsubscribe = (obj: QueryObject) => {
  objStore[obj.store].delete(obj);
};

const watchingAttrs = (changedAttrs: Array<string>, watchAttrs: Array<string>): Boolean => {
  for (let i = 0; i < changedAttrs.length; i++) {
    if (watchAttrs.includes(changedAttrs[i])) {
      return true;
    }
  }

  return false;
};

/**
 * get the core state object that contains all of the stores
 * 
 * https://github.com/kmurph73/set-state-is-great#getfullstate
 * 
 * @example
 *  store.getFullState();
 *
 */
const getFullState = (store: string): StateObj => state;

/**
 * replace the state of a store
 * 
 * rerenders components watching any of the attrs that have differing values between the previous and next state
 * 
 * https://github.com/kmurph73/set-state-is-great#assignstate
 * 
 * @example
 *  store.assignState('modal', {open: true, title: 'muh modal'});
 *
 */
const assignState = (store: string, nextState: PlainObject): void => {
  const changedAttrs: Array<string> = [];

  const existingState = state[store];

  const allAttrs = new Set(Object.keys(nextState).concat(Object.keys(existingState)));

  allAttrs.forEach((attr) => {
    if (existingState[attr] !== nextState[attr]) {
      changedAttrs.push(attr);
    }
  });

  state[store] = nextState;

  const forceUpdatesToCall: Array<ForceUpdateIfMounted> = [];

  for (let [obj, forceUpdate] of objStore[store].entries()) {
    if ((!obj.watchAttrs) || watchingAttrs(changedAttrs, obj.watchAttrs)) {
      forceUpdatesToCall.push(forceUpdate);
    }
  }

  const len = forceUpdatesToCall.length;
  for(let i = 0; i < len; i++) {
    forceUpdatesToCall[i]();
  }
};

/**
 * *assign* values to a store.  if you want to replace the object in a store, there's assignState
 * 
 * https://github.com/kmurph73/set-state-is-great#setstate
 * 
 * @example
 *  store.setState('drawer', {open: true});
 *
 */
const setState = (store: string, nextState: PlainObject): void => {
  const changedAttrs: Array<string> = [];

  const existingState = state[store];

  for (var attr in nextState) {
      if (existingState[attr] !== nextState[attr]) {
      existingState[attr] = nextState[attr];
      changedAttrs.push(attr);
    }
  }

  const forceUpdatesToCall: Array<ForceUpdateIfMounted> = [];

  for (let [obj, forceUpdate] of objStore[store].entries()) {
    if ((!obj.watchAttrs) || watchingAttrs(changedAttrs, obj.watchAttrs)) {
      forceUpdatesToCall.push(forceUpdate);
    }
  }

  const len = forceUpdatesToCall.length;
  for(let i = 0; i < len; i++) {
    forceUpdatesToCall[i]();
  }
};

/**
 * Access a store's state via `getState(store)`:
 *
 * https://github.com/kmurph73/set-state-is-great#getstate
 *
 * @example
 *  store.getState('drawer');
 * 
 */
export const getState = (store: string) => state[store];

const createSetState = (store: string) => (state: PlainObject) => {
  setState(store, state);
};

const createGetState = (store: string) => () => {
  return getState(store);
};

const createAssignState = (store: string) => (state: PlainObject) => {
  assignState(store, state);
};

/**
 * forceUpdate this component from anywhere (if it's still mounted - if not, nothing bad happens).
 *
 * https://github.com/kmurph73/set-state-is-great#forceupdatevianame
 *
 * @example
 *  window.App.store.forceUpdateViaName('post', 'post_detail');
 * 
 */
const forceUpdateViaName = (store: string, name: string) => {
  for (let [obj, forceUpdate] of objStore[store].entries()) {
    if (obj.name === name) {
      forceUpdate();
      return
    }
  }
};

/**
 * Create the central store of your app (composed of smaller stores - 
 * EG `main`, `drawer`, `home` shown below)
 *
 * https://github.com/kmurph73/set-state-is-great#creating-the-store
 *
 * @example
 *  import {createStore} from 'set-state-is-great';
 * 
 *  const store = createStore({
 *    main: {viewShown: 'Home'},
 *    drawer: {open: false},
 *    home: {title: 'Home'}
 *  });
 */
export const createStore = (initialState: PlainObject) => {
  state = initialState;

  for (var store in initialState) {
    objStore[store] = new Map();
  }

  return { getFullState, setState, getState, assignState, forceUpdateViaName };
};

/**
 * get setState & getState helpers
 *
 * https://github.com/kmurph73/set-state-is-great#getstatehelpers
 *
 * @example
 * import {getStateHelpers} from 'set-state-is-great';
 * 
 * const {query, getState, setState} = getStateHelpers({
 *   store: 'drawer',
 *   watchAttrs: ['open']
 * });
 */
export const getStateHelpers = (query: QueryObject) => {
  return {
    query: query,
    getState: createGetState(query.store),
    setState: createSetState(query.store),
    assignState: createAssignState(query.store)
  }
};