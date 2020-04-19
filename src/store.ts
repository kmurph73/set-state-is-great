import { ForceUpdateIfMounted } from './types';
import useStoreState from './useStoreState';

export type PlainObject = { [name: string]: unknown };
// https://stackoverflow.com/a/42028363/548170
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainObject(obj: any): obj is PlainObject {
  return (obj && obj.constructor === Object) || false;
}

export default class Store<State, Key extends keyof State> {
  private state: Map<Key, State[Key]>;

  private objStore: Map<Key, { memoized: boolean; forceUpdate: ForceUpdateIfMounted }>;

  constructor(state: Map<Key, State[Key]>) {
    this.state = state;
    this.objStore = new Map();
  }

  /**
   * Get the central state object that holds all of the stores.
   * https://github.com/kmurph73/set-state-is-great#getfull
   */
  getFullStateMap() {
    return this.state;
  }

  /**
   * force update all components watching a particular store
   *
   * https://github.com/kmurph73/set-state-is-great#force-updating-components
   *
   * @example
   *  store.forceUpdate('drawer');
   *
   */
  forceUpdate(key: Key) {
    const forceUpdate = this.objStore.get(key)?.forceUpdate;

    if (forceUpdate) {
      forceUpdate();
    }
  }

  /**
   * force update all memo'd components
   *
   * https://github.com/kmurph73/set-state-is-great#force-updating-components
   *
   * @example
   *  store.forceUpdateEverything();
   *
   */
  forceUpdateMemoized() {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    for (const [key, obj] of this.objStore) {
      if (obj.memoized) {
        obj.forceUpdate();
      }
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
  setState(key: Key, partialNextState: Partial<State[Key]>) {
    if (isPlainObject(partialNextState)) {
      const existingState = this.state.get(key);

      if (!existingState) {
        throw new Error(`State doesnt have ${key}`);
      }

      if (existingState === partialNextState) {
        throw new Error(
          `You cannot pass an existing state object to setState.  If you want to force a rerender, use forceUpdate(key)`,
        );
      }

      const nextState = { ...existingState, ...partialNextState };

      this.state.set(key, nextState);
    } else {
      this.state.set(key, partialNextState);
    }

    this.forceUpdate(key);
  }

  assignState(key: Key, nextState: State[Key]) {
    this.state.set(key, nextState);
    this.forceUpdate(key);
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
  getState(key: Key) {
    return this.state.get(key);
  }

  private createGetState(key: Key) {
    /**
     * Access a (scoped) store's state via `store.getHelpers(storeName)`:
     *
     * https://github.com/kmurph73/set-state-is-great#gethelpers
     *
     * @example
     *  const {getState} = store.getHelpers('drawer');
     *  const drawerState = getState();
     *
     */
    return () => {
      return this.getState(key);
    };
  }

  private createSetState(key: Key) {
    /**
     * *set* values on a (scoped) store via `store.getHelpers(storeName)`
     *
     * https://github.com/kmurph73/set-state-is-great#gethelpers
     *
     * @example
     *  const {getState} = store.getHelpers('drawer');
     *  setState({open: true});
     *
     */
    return (next: Partial<State[Key]>) => {
      return this.setState(key, next);
    };
  }

  private createAssignState(key: Key) {
    return (next: State[Key]) => {
      return this.assignState(key, next);
    };
  }

  unsubscribe(key: Key) {
    this.objStore.delete(key);
  }

  subscribe(key: Key, forceUpdate: ForceUpdateIfMounted, memoized: boolean) {
    this.objStore.set(key, {
      forceUpdate: forceUpdate,
      memoized: memoized,
    });
  }

  private createUseStore(key: Key, memoized: false) {
    return () => {
      return useStoreState(this, key, memoized);
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
  getHelpers(key: Key, memoized: false) {
    return {
      useStoreState: this.createUseStore(key, memoized),
      getState: this.createGetState(key),
      setState: this.createSetState(key),
      assignState: this.createAssignState(key),
    };
  }
}
