import React from 'react';
import { ForceUpdateIfMounted } from './types';
import useForceUpdateIfMounted from './useForceUpdateIfMounted';
import useComponentId from './useComponentId';

export default class Store<State> {
  private state: State;

  private objStore: Map<
    number,
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
  setState<K extends keyof State>(store: K, nextState: State[K]) {
    const changedAttrs: Array<string> = [];

    const existingState = this.state[store];

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
  getState<K extends keyof State>(s: K) {
    return this.state[s];
  }

  private createGetState<K extends keyof State>(s: K) {
    return () => {
      return this.getState<K>(s);
    };
  }

  private createSetState<K extends keyof State>(s: K) {
    return (next: State[K]) => {
      return this.setState(s, next);
    };
  }

  private unsubscribe(id: number) {
    this.objStore.delete(id);
  }

  private subscribe<K extends keyof State, X extends keyof State[K]>(
    id: number,
    store: K,
    forceUpdate: ForceUpdateIfMounted,
    watchAttrs?: Array<X> | null,
  ) {
    this.objStore.set(id, {
      store: store,
      watchAttrs: watchAttrs as Array<string>,
      forceUpdate: forceUpdate,
    });
  }

  /**
   * access and observe changes to a store's state
   *
   * https://github.com/kmurph73/set-state-is-great#the-usestorestate-hook
   *
   * @example
   *
   * function Drawer() {
   *   const {open} = store.useStoreState('drawer', ['open']);
   *   return (
   *     <MuiDrawer open={open}>
   *       <div>just drawer things</div>
   *     </MuiDrawer>
   *   )
   * }
   */
  useStoreState<K extends keyof State, X extends keyof State[K]>(store: K, watchAttrs?: Array<X>) {
    const id = useComponentId();
    this.subscribe(id, store, useForceUpdateIfMounted(), watchAttrs);

    React.useEffect(
      () => (): void => {
        this.unsubscribe(id);
      },
      [id],
    );

    return this.getState(store);
  }

  createUseStoreState<K extends keyof State, X extends keyof State[K]>(store: K, watchAttrs?: Array<X>) {
    return () => {
      return this.useStoreState(store, watchAttrs);
    };
  }

  getHelpers<K extends keyof State, X extends keyof State[K]>(store: K, watchAttrs?: Array<X>) {
    return {
      useStoreState: this.createUseStoreState(store, watchAttrs),
      getState: this.createGetState(store),
      setState: this.createSetState(store),
    };
  }
}
