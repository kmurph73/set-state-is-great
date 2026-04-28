export default class Store {
    state;
    listeners;
    constructor(state) {
        this.state = state;
        this.listeners = new Map();
    }
    /**
     * subscribe to changes for a particular key. returns an unsubscribe function.
     *
     * primarily consumed by `useStoreState` / `useNonNullState`, but exposed for
     * non-React callers.
     */
    subscribe(key, listener) {
        let set = this.listeners.get(key);
        if (!set) {
            set = new Set();
            this.listeners.set(key, set);
        }
        set.add(listener);
        return () => {
            set.delete(listener);
        };
    }
    notify(key) {
        const set = this.listeners.get(key);
        if (set) {
            for (const listener of set) {
                listener();
            }
        }
    }
    /**
     * shallow-merge values into an object value (immutable — produces a new object).
     *
     * @param {Key} key - the key you'd like to update
     * @param {Partial<State[Key]>} partialNextState - the key/values you'd like to merge into the existing object
     *
     * https://github.com/kmurph73/set-state-is-great#setstate--setpartialstate
     *
     * @example
     *  store.setPartialState('drawer', { open: true });
     */
    setPartialState(key, partialNextState) {
        const existingState = this.state[key];
        if (!existingState) {
            throw new Error(`State doesnt have ${key.toString()}; use setState if you want to assign an object`);
        }
        this.state[key] = { ...existingState, ...partialNextState };
        this.notify(key);
    }
    /**
     * set a value for a key
     *
     * @param {Key} key - the key whose value you'd like to replace
     *
     * @param {State[Key]} nextState - the replacing value
     *
     * https://github.com/kmurph73/set-state-is-great#setstate--setpartialstate
     *
     * @example
     *  store.setState('viewShown', 'Home');
     */
    setState(key, nextState) {
        this.state[key] = nextState;
        this.notify(key);
    }
    /**
     * set state & rerender _only_ if the new val is different from the old
     *
     * @example
     *  store.setStateIfDifferent('breakpoint', 'sm');
     */
    setStateIfDifferent(key, nextState) {
        if (this.state[key] === nextState) {
            return;
        }
        this.state[key] = nextState;
        this.notify(key);
    }
    /**
     * get a NonNullified key's state
     *
     * https://github.com/kmurph73/set-state-is-great#getstate
     *
     * @example
     *  store.getNonNullState('drawer');
     */
    getNonNullState(key) {
        const state = this.state[key];
        if (state == null) {
            throw new Error(`${key.toString()}'s state should be here`);
        }
        else {
            return state;
        }
    }
    /**
     * gives you setPartialState, setState & setStateIfDifferent scoped to a particular store
     *
     * https://github.com/kmurph73/set-state-is-great#gethelpers
     *
     * @example
     *
     * const { setPartialState } = store.getHelpers('productForm');
     *
     * const onChange = (e) => {
     *   setPartialState({name: e.target.value});
     * };
     *
     * function Formy() {
     *   const form = useNonNullState(store, 'productForm');
     *   return (
     *     <div>
     *       <input value={form.name} onChange={onChange} />
     *     </div>
     *   )
     * }
     */
    getHelpers(key) {
        return {
            setPartialState: (next) => {
                return this.setPartialState(key, next);
            },
            setStateIfDifferent: (next) => {
                return this.setStateIfDifferent(key, next);
            },
            setState: (next) => {
                return this.setState(key, next);
            },
        };
    }
}
