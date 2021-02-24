# Set State is Great

<p align='center'>A global store + setState + hooks integration.</p>

Global state management without the ceremony.  Zero dependency (other than React of course). No Context or reducers.  Written in & optimized for TypeScript.

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
  const { open } = store.useState('drawer', 'Drawer');

  return (
    <MuiDrawer open={open}>
      <div>just drawer things</div>
    </MuiDrawer>
  );
}

export default Drawer;
```

[Why do I have to pass in the component name?](#why-do-I-have-to-pass-in-the-component-name)

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

## Why do I have to pass in the component name?

`store.useState` requires that you pass in both the key to be watched, and the calling component, eg:

`store.useState('drawer', 'Drawer')` if the current component is named Drawer.

Previously, one didn't have to do this, since SSiG internally used [useComponentId](https://gist.github.com/sqren/fc897c1629979e669714893df966b1b7) to identify the component.  This works fine, but since `useComponentId` has a side effect (albeit harmless), it's [not so compatible with StrictMode](https://github.com/facebook/react/issues/20826).

I considered providing both a `StrictStore` and `Store` class, in case one wasn't using `StrictMode`.  But I didn't want to maintain two classes, and don't want to discourage people from using `StrictMode`.

Further, passing in the component name has the benefit of making the currently stored components more inspectable.  If you look at `store.componentStore`, you'll see a map of the state keys, and then a map of the current components and their `forceUpdate` functions.  This enables you to quickly see what components SSiG is currently watching.

## [Strict Mode](https://reactjs.org/docs/strict-mode.html) Quirk

Only in Strict Mode, in dev environment.  This lib relies on [useComponentId](https://gist.github.com/sqren/fc897c1629979e669714893df966b1b7#gistcomment-3591823), which in Strict Mode, produces a differing value on SM's double render.  This may cause React to falsely warn of a memory leak, again in dev only.

## Todo

- Tests
- chill

## License

MIT
