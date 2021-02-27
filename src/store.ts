/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ForceUpdateIfMounted, SubscribeOpts } from './types';
import useStoreState from './useStoreState';

export type PlainObject = { [name: string]: unknown };
// https://stackoverflow.com/a/42028363/548170
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainObject(obj: any): obj is PlainObject {
  return (obj && obj.constructor === Object) || false;
}

// ComponentMap stores all of the currently subscribed components for a given key
type ComponentMap = Map<string, { memoized: boolean; forceUpdate: ForceUpdateIfMounted }>;

export default class Store<State> {
  state: State;

  private componentStore: Map<keyof State, ComponentMap>;

  constructor(state: State) {
    this.state = state;
    this.componentStore = new Map();
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
  forceUpdate(key: keyof State): void {
    const componentObj = this.componentStore.get(key);

    if (componentObj) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      for (const [_componentName, obj] of componentObj) {
        obj.forceUpdate();
      }
    }
  }

  private createForceUpdate<Key extends keyof State>(key: Key) {
    return (): void => {
      return this.forceUpdate(key);
    };
  }

  /**
   * force update all memo'd components
   *
   * https://github.com/kmurph73/set-state-is-great#force-updating-components
   *
   * @example
   *  store.forceUpdateMemoized();
   *
   */
  forceUpdateMemoized(): void {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    for (const [_key, componentObj] of this.componentStore) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      for (const [_componentName, obj] of componentObj) {
        if (obj.memoized) {
          obj.forceUpdate();
        }
      }
    }
  }

  /**
   * *assign* values to an object value
   *
   * https://github.com/kmurph73/set-state-is-great#setstate--setpartialstate
   *
   * @example
   *  store.setPartialState('drawer', {open: true});
   *
   */
  setPartialState<Key extends keyof State>(key: Key, partialNextState: Partial<State[Key]>): void {
    if (isPlainObject(partialNextState)) {
      const existingState = this.state[key];

      if (!existingState) {
        throw new Error(`State doesnt have ${key}; use setState if you want to assign an object`);
      }

      if (existingState === partialNextState) {
        throw new Error(
          `You cannot pass an existing state object to setState.  If you want to force a rerender, use forceUpdate(key)`,
        );
      }

      Object.assign(existingState, partialNextState);
    } else {
      throw new Error('You must pass in a plain JS object to setPartialState');
    }

    this.forceUpdate(key);
  }

  private createSetPartialState<Key extends keyof State>(key: Key) {
    return (next: Partial<State[Key]>): void => {
      return this.setPartialState(key, next);
    };
  }

  /**
   * set a value for a key
   *
   * https://github.com/kmurph73/set-state-is-great#setstate--setpartialstate
   *
   * @example
   *  store.setState('viewShown', 'Home');
   *
   */
  setState<Key extends keyof State>(key: Key, nextState: State[Key]): void {
    this.state[key] = nextState;
    this.forceUpdate(key);
  }

  private createSetState<Key extends keyof State>(key: Key) {
    return (next: State[Key]): void => {
      return this.setState(key, next);
    };
  }

  /**
   * set state & rerender _only_ if the new val is different from the old
   *
   * @example
   *  store.setStateIfDifferent('breakpoint', 'sm');
   *
   */
  setStateIfDifferent<Key extends keyof State>(key: Key, nextState: State[Key]): void {
    if (this.state[key] === nextState) {
      return;
    }

    this.state[key] = nextState;
    this.forceUpdate(key);
  }

  /**
   * set partial state & rerender _only_ if the new val is different from the old
   *
   * @example
   *  store.setPartialStateIfDifferent('user_form', {name: 'Jim'});
   *
   */
  setPartialStateIfDifferent<Key extends keyof State>(key: Key, partialNextState: Partial<State[Key]>): void {
    if (isPlainObject(partialNextState)) {
      const existingState = this.state[key];
      if (!existingState) {
        throw new Error(`State doesnt have ${key}; use setState if you want to assign an object`);
      }

      if (existingState === partialNextState) {
        throw new Error(
          `You cannot pass an existing state object to setState.  If you want to force a rerender, use forceUpdate(key)`,
        );
      }

      let differs = false;
      for (const prop in partialNextState) {
        if (existingState[prop] !== partialNextState[prop]) {
          differs = true;
        }
      }

      if (differs) {
        Object.assign(existingState, partialNextState);
        this.forceUpdate(key);
      }
    } else {
      throw new Error('You must pass in a plain JS object to setPartialState');
    }
  }

  private createSetPartialStateIfDifferent<Key extends keyof State>(key: Key) {
    return (next: Partial<State[Key]>): void => {
      return this.setPartialStateIfDifferent(key, next);
    };
  }

  /**
   * Get a key's state via `store.getState(key)`:
   *
   * https://github.com/kmurph73/set-state-is-great#getstate
   *
   * @example
   *  store.getState('drawer');
   *
   */
  getState<Key extends keyof State>(key: Key): State[Key] {
    return this.state[key];
  }

  private createGetState<Key extends keyof State>(key: Key) {
    return (): State[Key] => {
      return this.getState(key);
    };
  }

  /**
   * Get a non-nullified key's state w/ `store.getNonNullState(key)`:
   *
   * https://github.com/kmurph73/set-state-is-great#getstate
   *
   * @example
   *  store.getNonNullState('drawer', 'Drawer');
   *
   */
  getNonNullState<Key extends keyof State>(key: Key): NonNullable<State[Key]> {
    const state = this.state[key];

    if (state === undefined || state === null) {
      throw new Error(`${key}'s state should be here`);
    } else {
      return state!;
    }
  }

  private createGetNonNullState<Key extends keyof State>(key: Key) {
    return (): NonNullable<State[Key]> => {
      return this.getNonNullState(key);
    };
  }

  unsubscribe<Key extends keyof State>(key: Key, componentName: string): void {
    const obj = this.componentStore.get(key);

    if (obj) {
      obj.delete(componentName);
    }
  }

  subscribe<Key extends keyof State>(
    key: Key,
    componentName: string,
    forceUpdate: ForceUpdateIfMounted,
    opts?: SubscribeOpts,
  ): void {
    const componentStore = this.componentStore.get(key);

    if (componentStore) {
      const componentObj = componentStore.get(componentName);

      if (componentObj) {
        componentObj.forceUpdate = forceUpdate;
      } else {
        componentStore.set(componentName, { memoized: opts?.memoized || false, forceUpdate });
      }
    } else {
      const componentMap = new Map();
      componentMap.set(componentName, { memoized: opts?.memoized || false, forceUpdate });
      this.componentStore.set(key, componentMap);
    }
  }

  useState<Key extends keyof State>(key: Key, componentName: string, opts?: SubscribeOpts): State[Key] {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useStoreState(this, key, componentName, opts);
  }

  private createUseStoreState<Key extends keyof State>(key: Key, componentName: string, memoized: boolean) {
    return (): State[Key] => {
      return useStoreState(this, key, componentName, { memoized });
    };
  }

  useNonNullState<Key extends keyof State>(
    key: Key,
    componentName: string,
    opts?: SubscribeOpts,
  ): NonNullable<State[Key]> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const state = useStoreState(this, key, componentName, { memoized: opts?.memoized || false });

    if (state === null || state === undefined) {
      throw new Error(`${key}'s state should be here`);
    } else {
      return state!;
    }
  }

  private createUseNonNullState<Key extends keyof State>(key: Key, componentName: string, memoized: boolean) {
    return (): NonNullable<State[Key]> => {
      return this.useNonNullState(key, componentName, { memoized });
    };
  }

  /**
   * getScopedHelpers gives you useStoreState, useNonNullState, getState, getNonNullState, forceUpdate,
   *   setState, setPartialState & setStateIfDifferent scoped to a particular store.
   *
   *
   * https://github.com/kmurph73/set-state-is-great#getscopedfns
   *
   * @example
   *
   * const {getState, setState, useStoreState} = store.getScopedHelpers('drawer', 'Drawer')
   *
   * function Drawer() {
   *   const {open} = useStoreState();
   *
   *   return (
   *     <MuiDrawer open={open}>
   *       <div>just drawer things</div>
   *     </MuiDrawer>
   *   )
   * }
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getScopedHelpers<Key extends keyof State>(key: Key, componentName: string, opts?: { memoized?: boolean }) {
    return {
      useStoreState: this.createUseStoreState(key, componentName, opts?.memoized || false),
      useNonNullState: this.createUseNonNullState(key, componentName, opts?.memoized || false),
      getState: this.createGetState(key),
      getNonNullState: this.createGetNonNullState(key),
      setState: this.createSetState(key),
      forceUpdate: this.createForceUpdate(key),
      setPartialState: this.createSetPartialState(key),
      setPartialStateIfDifferent: this.createSetPartialStateIfDifferent(key),
    };
  }
}
