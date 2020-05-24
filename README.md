# Set State is Great
<p align='center'>A global store + setState + hooks integration.</p>

Global state management without the ceremony.  No Context, Redux, actions, thunks, selectors, or anything that ends in "ducer."  Zero dependency (other than React of course).  Written in & optimized for TypeScript.

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
import {Store} from 'set-state-is-great';

const appState = {
  viewShown: 'Home',
  colormode: 'dark',
  drawer: {open: false, other: '?'},
};

const store = new Store(appState);
```

## setState & setPartialState

For mutating a store's data, there's `setState` & `setPartialState`:

`setState` _replaces_ the state for a key:
```javascript
store.setState('drawer', {open: true, other: 'yup'});
```

Use `setPartialState` for partial updates to objects, it will _assign_ the new values to the existing object:

```javascript
store.setPartialState('drawer', {open: true});
```

## `store.useNonNullState` & `store.useState`

`useNonNullState` assumes that the state returned is not null or undefined:

```javascript
import {store} from './constants';

function Drawer() {
  const {open} = store.useNonNullState('drawer');

  return (
    <MuiDrawer open={open}>
      <div>just drawer things</div>
    </MuiDrawer>
  )
}

export default Drawer;
```

`useState` returns the state as it is, so it could be null/undefined.

```javascript
import {store} from './constants';

function Drawer() {
  // state could be undefined/null here
  const state = store.useState('drawer');

  return (
    <MuiDrawer open={!!state?.open}>
      <div>just drawer things</div>
    </MuiDrawer>
  )
}

export default Drawer;
```

## getHelpers

`getHelpers` gives you the following helpers scoped to a particular store:

`useStoreState` `useNonNullState` `getState` `getNonNullState` `setState` `setPartialState`

```javascript
import {store} from './constants';

const {setPartialState: setState, useNonNullState: useDrawerState} = store.getHelpers('drawer')

const close = () => {
  setState({open: false})
};


function Drawer() {
  const {open} = useDrawerState();

  return (
    <MuiDrawer open={open}>
      <div onClick={close}>close drawer</div>
    </MuiDrawer>
  )
}

export default Drawer;
```

## getState

You can access a store's state via `getState(key)` & `getNonNullState(key)`:

```javascript
store.getState('drawer');
store.getNonNullState('drawer');
```

## getStateObj

Get the central state object that holds all of the stores.

```javascript
const allStores = store.getStateObj();
allStores.modal // {open: true, title: 'yup'} 
```

## Organizing the store (and some TypeScript)

I recommend creating something like a `constants.ts` file with a `store` variable and function to set it: 

``` TypeScript
// constants.ts
import { Store } from "set-state-is-great";
import { AppState } from "./types";

export var store: Store<AppState>;

export const setStore = (theStore: Store<AppState>) => {
  store = theStore
  window.App = {store: theStore}
}
```

Then you can set it when creating your store:

``` TypeScript
// store.ts
import {Store} from 'set-state-is-great';
import {AppState} from './types';
import {setStore} from './constants';

const appState: AppState = {
  drawer: {open: false},
  modal: {open: false, title: 'nada'},
}

const store = new Store<AppState>(appState);

setStore(store);
```

Then you can import the store from any file: `import {store} from './constants';`

## TypeScript

SSiG is written in & optimized for TS, and it's highly recommended that you use it with TS.  

To do so, define your store's state like so:

``` TypeScript
type DrawerState = {
  open: boolean;
}

type ModalState = {
  open: boolean;
  title: string;
}

export type AppState = {
  drawer?: DrawerState;
  modal?: ModalState;
}
```

Then pass in AppState as a Generic when creating your store:

```TypeScript
const store = new Store<AppState>({});
```

Now TS will be able to check that you're passing in the correct parameters into things like `useStore`, eg:

```TypeScript
// TS will warn that there's no "blah" attr in the drawer store
const drawerState = store.useStore('drawer', ['blah']);

// TS will warn that there's no "blah" store
const drawerState = store.useStore('blah');
```

## Force updating components

``` TypeScript
// forceUpdate all components watching a particular store
store.forceUpdate('drawer');
```

## Todo

* Tests
* chill

## License

MIT