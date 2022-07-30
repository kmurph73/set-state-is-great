export default class Store {
    constructor(state) {
        this.state = state;
        this.componentStore = new Map();
    }
    /**
     * force update all components watching a particular store
     *
     * @param {keyof State} key - the key you'd like to forceUpdate
     *
     * https://github.com/kmurph73/set-state-is-great#force-updating-components
     *
     * @example
     *  store.forceUpdate('drawer');
     *
     */
    forceUpdate(key) {
        const componentObj = this.componentStore.get(key);
        if (componentObj) {
            for (const [_id, forceUpdate] of componentObj) {
                forceUpdate();
            }
        }
    }
    /**
     * *assign* (via Object.assign) values to an object value.
     *
     * @param {Key} key - the key you'd like to update
     * @param {Partial<State[Key]>} partialNextState - the key/values you'd like to assign to an existing state object.  needs to be a plain object
     *
     * https://github.com/kmurph73/set-state-is-great#setstate--setpartialstate
     *
     * @example
     *  store.setPartialState('drawer', { open: true });
     *
     */
    setPartialState(key, partialNextState) {
        const existingState = this.state[key];
        if (!existingState) {
            throw new Error(`State doesnt have ${key.toString()}; use setState if you want to assign an object`);
        }
        if (existingState === partialNextState) {
            throw new Error(`You cannot pass an existing state object to setState.  If you want to force a rerender, use forceUpdate(key)`);
        }
        Object.assign(existingState, partialNextState);
        this.forceUpdate(key);
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
     *
     */
    setState(key, nextState) {
        this.state[key] = nextState;
        this.forceUpdate(key);
    }
    /**
     * set state & rerender _only_ if the new val is different from the old
     *
     * @example
     *  store.setStateIfDifferent('breakpoint', 'sm');
     *
     */
    setStateIfDifferent(key, nextState) {
        if (this.state[key] === nextState) {
            return;
        }
        this.state[key] = nextState;
        this.forceUpdate(key);
    }
    /**
     * get a NonNullified key's state
     *
     * https://github.com/kmurph73/set-state-is-great#getstate
     *
     * @example
     *  store.getNonNullState('drawer');
     *
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
