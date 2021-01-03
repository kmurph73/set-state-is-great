# Set State is Great

<p align='center'>A global store + setState + hooks integration.</p>

Global state management without the ceremony. No Context, Redux, actions, thunks, selectors, or anything that ends in "ducer." Zero dependency (other than React of course). Written in & optimized for TypeScript.

## Installing

```
npm install set-state-is-great
```

or

```
yarn add set-state-is-great
```

## Creating the store

Set State is Great (SSiG) is, at its core, just a key/value store.

```javascript
import { Store } from 'set-state-is-great';

const appState = {
  viewShown: 'Home',
  colormode: 'dark',
  drawer: { open: false, other: '?' },
};

const store = new Store(appState);
```

## setState & setPartialState

For mutating a store's data, there's `setState` & `setPartialState`:

`setState` _replaces_ the state for a key:

```javascript
store.setState('drawer', { open: true, other: 'yup' });
```

Use `setPartialState` for partial updates to objects, it will _assign_ the new values to the existing object:

```javascript
store.setPartialState('drawer', { open: true });
```

## `store.useState`

Watch for changes to a particular key using `store.useState`

```javascript
import { store } from './constants';

function Drawer() {
  const { open } = store.useState('drawer');

  return (
    <MuiDrawer open={open}>
      <div>just drawer things</div>
    </MuiDrawer>
  );
}

export default Drawer;
```

## `store.useNonNullState`

If the value could be null or undefined, but you expect it not to be, `useNonNullState` will throw an error if the value is null or undefined.

```javascript
const { open } = store.useNonNullState('drawer');
```

If using TypeScript, the returning value will be [non-nullified](https://www.typescriptlang.org/docs/handbook/utility-types.html#nonnullabletype)

## getScopedHelpers

`getScopedHelpers` gives you the following functions scoped to a particular key:

`useStoreState`, `useNonNullState`, `getState`, `getNonNullState`, `forceUpdate`, `setState`, `setPartialState`, `setStateIfDifferent`

```javascript
import { store } from './constants';

const { setPartialState, useNonNullState: useDrawerState } = store.getScopedHelpers('drawer');

const close = () => {
  setPartialState({ open: false });
};

function Drawer() {
  const { open } = useDrawerState();

  return (
    <MuiDrawer open={open}>
      <div onClick={close}>close drawer</div>
    </MuiDrawer>
  );
}

export default Drawer;
```

## `store.state`

Access the central state obj via `store.state`.

Feel free to mutate it as you see fit.

```javascript
store.state.drawer; // => {open: true, other: 'yup'}
store.state.drawer.open = false;
store.forceUpdate('drawer');
```

Or just replace it wholesale:

```javascript
store.state = {
  viewShown: 'Home',
  colormode: 'light',
  drawer: { open: false, other: '?' },
};
```

## Force updating components

```TypeScript
// forceUpdate all components watching a particular key
store.forceUpdate('drawer');
```

## setStateIfDifferent

`setStateIfDifferent` will only rerender watching components if the value differs. EG:

```TypeScript
store.setStateIfDifferent('breakpoint', 'sm');`
```

## getState

You can also access a store's state via `getState(key)` & `getNonNullState(key)`:

```javascript
store.getState('drawer');
store.state.drawer; // or just do this
store.getNonNullState('drawer');
```

## Organizing the store (and some TypeScript)

I recommend creating something like a `constants.ts` file with a `store` variable and function to set it:

```TypeScript
// constants.ts
import { Store } from "set-state-is-great";
import { AppState } from "./types";

export var store: Store<AppState>;

export const setStore = (theStore: Store<AppState>) => {
  store = theStore
  window.App = { store: theStore }
}
```

Then you can set it when creating your store:

```TypeScript
// store.ts
import { Store } from 'set-state-is-great';
import { AppState } from './types';
import { setStore } from './constants';

const appState: AppState = {
  drawer: { open: false, other: '?' },
  modal: { open: false, title: 'nada' },
}

const store = new Store<AppState>(appState);

setStore(store);
```

Then you can import the store from any file: `import { store } from './constants';`

## TypeScript

SSiG is written in & optimized for TS, and it's highly recommended that you use it with TS.

To do so, define your store's state like so:

```TypeScript
type DrawerState = {
  open: boolean;
  other: string;
}

type ModalState = {
  open: boolean;
  title: string;
}

export type AppState = {
  colormode: 'dark' | 'light';
  drawer?: DrawerState;
  modal?: ModalState;
}
```

Then pass in AppState as a Generic when creating your store:

```TypeScript
const store = new Store<AppState>({ colormode: "dark" });
```

Now `setState` et al. will check that you're passing in the correct types.

## Todo

- Tests
- chill

## License

MIT
