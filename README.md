2022 update: React 18, [`useId`][1], cleaning house

[1]: https://reactjs.org/docs/hooks-reference.html#useid

# Set State is Great

<p align='center'>A global store + setState + hooks integration.</p>

Global state management without the ceremony. Zero dependency (other than React of course). No Context or reducers. Written in & optimized for TypeScript. Designed with performance and simplicity in mind.

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

Use `setPartialState` for partial updates to objects, it will _assign_ (via `Object.assign`) the new values to the existing object:

```javascript
store.setPartialState('drawer', { open: true });
```

## `useStoreState`

SSiG's main hook.  Use it to watch for changes to a particular key.

```javascript
import { store } from './globals';
import { useStoreState } from "set-state-is-great";

function Drawer() {
  const { open } = useStoreState(store, 'drawer');

  return (
    <MuiDrawer open={open}>
      <div>just drawer things</div>
    </MuiDrawer>
  );
}

export default Drawer;
```

## `useNonNullState`

The other hook - works just like `useStoreState`, but checks that the returning value is not null or undefined (and throws an error if it is).  Returning value is set to [NonNullable][2].

[2]: https://www.typescriptlang.org/docs/handbook/utility-types.html#nonnullabletype

## `store.state`

Access the central state obj via `store.state`.

Feel free to mutate it as you see fit.

```javascript
store.state.drawer; // => {open: true, other: 'yup'}
store.getNonNullState('drawer'); // throws an error if null or undefined
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

## Organizing the store (and some TypeScript)

How I do it: create a `constants.ts` file with a `store` variable and function to set it:

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

Then set it when creating the store:

```TypeScript
// store.ts
import { Store } from 'set-state-is-great';
import { AppState } from './types';
import { setStore } from './globals';

const appState: AppState = {
  drawer: { open: false, other: '?' },
  modal: { open: false, title: 'nada' },
}

const store = new Store<AppState>(appState);

setStore(store);
```

Then you import the store from any file: `import { store } from './globals';`

## getHelpers

`getHelpers` gives you the following functions scoped to a particular key:

`setState`, `setPartialState`, `setStateIfDifferent`

```javascript
import { store } from './globals';

const { setPartialState } = store.getHelpers('drawer');

const closeDrawer = () => {
  setPartialState({ open: false });
};
```

## TypeScript

SSiG is written in & optimized for TS, and it's highly recommended that you use it with TS.

To do so, first define your store's state:

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