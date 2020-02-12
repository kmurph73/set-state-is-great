import React from 'react';
import { ForceUpdateIfMounted } from './types';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
import useComponentId from './useComponentId';

export default class Store<State> {
  private state: State;

  private objStore: Map<
    string,
    {
      store: keyof State;
      watchAttrs?: Array<string> | null;
      forceUpdate: ForceUpdateIfMounted;
    }
  >;

  constructor(state: State) {
    this.state = state;
    this.objStore = new Map();
  }

  /**
   * Get the central state object that holds all of the stores.
   * https://github.com/kmurph73/set-state-is-great#getfullstate
   */
  getFullStore() {
    return this.state;
  }

  /**
   * *set* values on a store.
   *
   * https://github.com/kmurph73/set-state-is-great#setstate
   *
   * @example
   *  store.setState('drawer', {open: true});
   *
   */
  setState<Key extends keyof State>(store: Key, nextState: State[Key]) {
    const existingState = this.state[store];

    if (existingState === nextState) {
      throw `You cannot pass an existing state object to setState.  If you want to force a rerender, use forceUpdateViaStore(store) or forceUpdateEverything()`;
    }

    const changedAttrs: Array<string> = [];

    for (const attr in nextState) {
      if (existingState[attr] !== nextState[attr]) {
        existingState[attr] = nextState[attr];
        changedAttrs.push(attr);
      }
    }

    const forceUpdatesToCall: Array<ForceUpdateIfMounted> = [];

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    for (const [id, obj] of this.objStore) {
      if (obj.store === store && (!obj.watchAttrs || this.watchingAttrs(changedAttrs, obj.watchAttrs))) {
        forceUpdatesToCall.push(obj.forceUpdate);
      }
    }

    const len = forceUpdatesToCall.length;
    for (let i = 0; i < len; i++) {
      forceUpdatesToCall[i]();
    }
  }

  private watchingAttrs(changedAttrs: Array<string>, watchAttrs: Array<string>) {
    for (let i = 0; i < changedAttrs.length; i++) {
      if (watchAttrs.includes(changedAttrs[i])) {
        return true;
      }
    }

    return false;
  }

  /**
   * Access a store's state via `store.getState(store)`:
   *
   * https://github.com/kmurph73/set-state-is-great#getstate
   *
   * @example
   *  store.getState('drawer');
   *
   */
  getState<Key extends keyof State>(s: Key) {
    return this.state[s];
  }

  private createGetState<Key extends keyof State>(s: Key) {
    return () => {
      return this.getState<Key>(s);
    };
  }

  /**
   * Get a cloned store's state via `store.getClonedState(store)`:
   *
   * https://github.com/kmurph73/set-state-is-great#getclonedstate
   *
   * @example
   *  store.getState('drawer');
   *
   */
  getClonedState<Key extends keyof State>(s: Key) {
    const newObj = {} as State[Key];
    const state = this.state[s];
    for (const attr in state) {
      newObj[attr] = state[attr];
    }

    return newObj;
  }

  private createGetClonedState<Key extends keyof State>(s: Key) {
    return () => {
      return this.getClonedState<Key>(s);
    };
  }

  private createSetState<Key extends keyof State>(s: Key) {
    return (next: State[Key]) => {
      return this.setState(s, next);
    };
  }

  private unsubscribe(key: string) {
    this.objStore.delete(key);
  }

  private subscribe<Key extends keyof State, KeyOfStore extends keyof State[Key]>(
    key: string,
    store: Key,
    forceUpdate: ForceUpdateIfMounted,
    watchAttrs?: Array<KeyOfStore> | null,
  ) {
    this.objStore.set(key, {
      store: store,
      watchAttrs: watchAttrs as Array<string>,
      forceUpdate: forceUpdate,
    });
  }

  /**
   * access and observe changes to a store's state
   *
   * https://github.com/kmurph73/set-state-is-great#the-usestore-hook
   *
   * @example
   *
   * function Drawer() {
   *   const {open} = store.useStore('drawer', ['open']);
   *   return (
   *     <MuiDrawer open={open}>
   *       <div>just drawer things</div>
   *     </MuiDrawer>
   *   )
   * }
   */
  useStore<Key extends keyof State, KeyOfStore extends keyof State[Key]>(store: Key, watchAttrs?: Array<KeyOfStore>) {
    const id = useComponentId();
    const key = id + '-' + store;
    this.subscribe(key, store, useForceUpdateIfMounted(), watchAttrs);

    React.useEffect(
      () => (): void => {
        this.unsubscribe(key);
      },
      [key],
    );

    return this.getState(store);
  }

  createUseStore<Key extends keyof State, KeyOfStore extends keyof State[Key]>(
    store: Key,
    watchAttrs?: Array<KeyOfStore>,
  ) {
    return () => {
      return this.useStore(store, watchAttrs);
    };
  }

  /**
   * getHelpers gives you setState & getState & useStore scoped to a particular store.
   *
   * https://github.com/kmurph73/set-state-is-great#gethelpers
   *
   * @example
   *
   * // getState() returns drawer's state
   * // getClonedState() returns drawer's cloned state
   * // useStore is scoped to `drawer` and will observe changes to `open`
   * // setState sets drawer's state
   * const {getState, getClonedState, setState, useStore} = store.getHelpers('drawer', ['open'])
   *
   * function Drawer() {
   *   const {open} = useStore();
   *
   *   return (
   *     <MuiDrawer open={open}>
   *       <div>just drawer things</div>
   *     </MuiDrawer>
   *   )
   * }
   */
  getHelpers<Key extends keyof State, KeyOfStore extends keyof State[Key]>(store: Key, watchAttrs?: Array<KeyOfStore>) {
    return {
      useStoreState: this.createUseStore(store, watchAttrs),
      getState: this.createGetState(store),
      getClonedState: this.createGetClonedState(store),
      setState: this.createSetState(store),
    };
  }
}
