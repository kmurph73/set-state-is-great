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
   * force update all components watching a particular store
   *
   * https://github.com/kmurph73/set-state-is-great#forceupdating
   *
   * @example
   *  store.forceUpdate('drawer');
   *
   */
  forceUpdate<Key extends keyof State>(store: Key) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    for (const [id, obj] of this.objStore) {
      if (obj.store === store) {
        obj.forceUpdate();
      }
    }
  }

  /**
   * force update all components that are watching any store
   *
   * https://github.com/kmurph73/set-state-is-great#forceupdating
   *
   * @example
   *  store.forceUpdateEverything();
   *
   */
  forceUpdateEverything() {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    for (const [id, obj] of this.objStore) {
      obj.forceUpdate();
    }
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
  setState<Key extends keyof State>(store: Key, partialNextState: Partial<State[Key]>) {
    const changedAttrs: Array<string> = [];

    const existingState = this.state[store];

    if (existingState === partialNextState) {
      throw new Error(
        `You cannot pass an existing state object to setState.  If you want to force a rerender, use forceUpdate(store) or forceUpdateEverything()`,
      );
    }

    const nextState = { ...this.state[store], ...partialNextState };

    for (const attr in nextState) {
      if (existingState[attr] !== nextState[attr]) {
        existingState[attr] = nextState[attr];
        changedAttrs.push(attr);
      }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    for (const [id, obj] of this.objStore) {
      if (obj.store === store && (!obj.watchAttrs || this.watchingAttrs(changedAttrs, obj.watchAttrs))) {
        obj.forceUpdate();
      }
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

  private createUseStore<Key extends keyof State, KeyOfStore extends keyof State[Key]>(
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
   * // useStore is scoped to `drawer` and will observe changes to `open`
   * // setState sets drawer's state
   * const {getState, setState, useStore} = store.getHelpers('drawer', ['open'])
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
      setState: this.createSetState(store),
    };
  }
}
