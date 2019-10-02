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
      name?: string;
      forceUpdate: ForceUpdateIfMounted;
    }
  >;

  constructor(state: State) {
    this.state = state;
    this.objStore = new Map();
  }

  getStore() {
    return this.state;
  }

  /**
   * *assign* values to a store.  if you want to replace the object in a store, there's assignState
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
      if (!obj.watchAttrs || this.watchingAttrs(changedAttrs, obj.watchAttrs)) {
        forceUpdatesToCall.push(obj.forceUpdate);
      }
    }

    const len = forceUpdatesToCall.length;
    for (let i = 0; i < len; i++) {
      forceUpdatesToCall[i]();
    }
  }

  watchingAttrs(changedAttrs: Array<string>, watchAttrs: Array<string>) {
    for (let i = 0; i < changedAttrs.length; i++) {
      if (watchAttrs.includes(changedAttrs[i])) {
        return true;
      }
    }

    return false;
  }

  getState<K extends keyof State>(s: K) {
    return this.state[s];
  }

  createGetState<K extends keyof State>(s: K) {
    return () => {
      return this.getState<K>(s);
    };
  }

  createSetState<K extends keyof State>(s: K) {
    return (next: State[K]) => {
      return this.setState(s, next);
    };
  }

  unsubscribe(id: number) {
    this.objStore.delete(id);
  }

  subscribe<K extends keyof State, X extends keyof State[K]>(
    id: number,
    store: K,
    forceUpdate: ForceUpdateIfMounted,
    watchAttrs?: Array<X> | null,
    name?: string,
  ) {
    this.objStore.set(id, {
      store: store,
      watchAttrs: watchAttrs as Array<string>,
      forceUpdate: forceUpdate,
      name: name,
    });
  }

  useStoreState<K extends keyof State, X extends keyof State[K]>(
    store: K,
    watchAttrs?: Array<X> | null,
    name?: string,
  ) {
    const id = useComponentId();
    this.subscribe(id, store, useForceUpdateIfMounted(), watchAttrs, name);

    React.useEffect(
      () => (): void => {
        this.unsubscribe(id);
      },
      [id],
    );

    return this.getState(store);
  }

  createUseStoreState<K extends keyof State, X extends keyof State[K]>(
    store: K,
    watchAttrs?: Array<X> | null,
    name?: string,
  ) {
    return () => {
      return this.useStoreState(store, watchAttrs, name);
    };
  }

  getFns<K extends keyof State, X extends keyof State[K]>(store: K, watchAttrs?: Array<X> | null, name?: string) {
    return {
      useStoreState: this.createUseStoreState(store, watchAttrs, name),
      getState: this.createGetState(store),
      setState: this.createSetState(store),
    };
  }
}
