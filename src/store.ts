import { ForceUpdateIfMounted } from './types';
import useStoreState from './useStoreState';

export type PlainObject = { [name: string]: unknown };
// https://stackoverflow.com/a/42028363/548170
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainObject(obj: any): obj is PlainObject {
  return (obj && obj.constructor === Object) || false;
}

type StoreObj = { id: number; memoized: boolean; forceUpdate: ForceUpdateIfMounted };

const findStoreObj = (objects: StoreObj[], id: number): StoreObj | undefined => {
  for (let index = 0; index < objects.length; index++) {
    const obj = objects[index];

    if (obj.id === id) {
      return obj;
    }
  }
};

export default class Store<State> {
  private state: State;

  private objStore: Map<keyof State, StoreObj[]>;

  constructor(state: State) {
    this.state = state;
    this.objStore = new Map();
  }

  /**
   * Get the central state object that holds all of the stores.
   * https://github.com/kmurph73/set-state-is-great#getfull
   */
  getStateObj(): State {
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
  forceUpdate(key: keyof State): void {
    const objects = this.objStore.get(key);

    if (objects) {
      for (let index = 0; index < objects.length; index++) {
        objects[index].forceUpdate();
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
    for (const [key, objects] of this.objStore) {
      for (let index = 0; index < objects.length; index++) {
        const obj = objects[index];

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
   *  store.getNonNullState('drawer');
   *
   */
  getNonNullState<Key extends keyof State>(key: Key): NonNullable<State[Key]> {
    const state = this.state[key];

    if (state === undefined || state === null) {
      throw new Error(`${key}'s state should be here`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return state!;
    }
  }

  private createGetNonNullState<Key extends keyof State>(key: Key) {
    return (): NonNullable<State[Key]> => {
      return this.getNonNullState(key);
    };
  }

  /**
   * set a value for a key, dont rerender any watching stores
   *
   * https://github.com/kmurph73/set-state-is-great#placestate
   *
   * @example
   *  store.placeState('viewShown', 'Home');
   *
   */
  placeState<Key extends keyof State>(key: Key, nextState: State[Key]): void {
    this.state[key] = nextState;
  }

  private createPlaceState<Key extends keyof State>(key: Key) {
    return (next: State[Key]): void => {
      return this.placeState(key, next);
    };
  }

  unsubscribe<Key extends keyof State>(key: Key, id: number): void {
    const arr = this.objStore.get(key);

    if (arr) {
      for (let index = 0; index < arr.length; index++) {
        const obj = arr[index];

        if (obj.id === id) {
          arr.splice(index, 1);
          return;
        }
      }
    }
  }

  subscribe<Key extends keyof State>(key: Key, id: number, forceUpdate: ForceUpdateIfMounted, memoized: boolean): void {
    const arr = this.objStore.get(key);

    if (arr) {
      const obj = findStoreObj(arr, id);

      if (obj) {
        obj.forceUpdate = forceUpdate;
      } else {
        arr.push({ id, forceUpdate, memoized });
      }
    } else {
      this.objStore.set(key, [{ id, forceUpdate, memoized }]);
    }
  }

  useState<Key extends keyof State>(key: Key, memoized = false): State[Key] {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useStoreState(this, key, memoized);
  }

  private createUseStoreState<Key extends keyof State>(key: Key, memoized = false) {
    return (): State[Key] => {
      return useStoreState(this, key, memoized);
    };
  }

  useNonNullState<Key extends keyof State>(key: Key, memoized = false): NonNullable<State[Key]> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const state = useStoreState(this, key, memoized);

    if (state === null || state === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return state!;
    } else {
      throw new Error(`${key}'s state should be here`);
    }
  }

  private createUseNonNullState<Key extends keyof State>(key: Key, memoized = false) {
    return (): NonNullable<State[Key]> => {
      return this.useNonNullState(key, memoized);
    };
  }

  /**
   * getScopedFns gives you useStoreState, useNonNullState, getState, getNonNullState, forceUpdate,
   *   setState, setPartialState, setStateIfDifferent & placeState scoped to a particular store.
   *
   *
   * https://github.com/kmurph73/set-state-is-great#getscopedfns
   *
   * @example
   *
   * const {getState, setState, useStoreState} = store.getScopedFns('drawer')
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
  getScopedFns<Key extends keyof State>(key: Key, memoized = false) {
    return {
      useStoreState: this.createUseStoreState(key, memoized),
      useNonNullState: this.createUseNonNullState(key, memoized),
      getState: this.createGetState(key),
      getNonNullState: this.createGetNonNullState(key),
      setState: this.createSetState(key),
      placeState: this.createPlaceState(key),
      forceUpdate: this.createForceUpdate(key),
      setPartialState: this.createSetPartialState(key),
      setPartialStateIfDifferent: this.createSetPartialStateIfDifferent(key),
    };
  }
}
