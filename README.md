# Set State is Great
<p align='center'>A global store + setState + hooks integration.</p>

Global state management without the ceremony.  No Context, Redux, actions, thunks, selectors, or anything that ends in "ducer."  Zero dependency (other than React of course).  [And now written in TypeScript!](https://github.com/kmurph73/set-state-is-great/pull/5)

## Installing

```
npm install set-state-is-great
```
or
```
yarn add set-state-is-great
```

## Creating the store

Set State is Great (SSiG)'s data is organized by _stores_, which are objects that represent logical groupings of state (often pertaining to a particular component). EG: 

```javascript
import {Store} from 'set-state-is-great';

const appState = {
  main: {viewShown: 'Home'},
  drawer: {open: false},
  home: {title: 'Home'}
};

const store = new Store(appState);
```

In this scenario, `main`, `drawer`, and `home` are your _stores_.

Since SSiG is intended to be a global store, feel free to attach `store` to a top-level object for global access, eg:

``` javascript
window.App = {store};
```

## setState

For mutating a store's data, there's `setState`:

```javascript
store.setState('drawer', {open: true});
```

## The `useStore` Hook
SSiG's only hook (for now): `useStore`

```javascript
import {store} from './constants';

function Drawer() {
  const {open} = store.useStore('drawer', ['open']);

  return (
    <MuiDrawer open={open}>
      <div>just drawer things</div>
    </MuiDrawer>
  )
}

export default React.memo(Drawer);
```

Here we watch for changes to the `open` attr on the `drawer` store - the component will only rerender if `open` changes.

However, despite only watching `open`, useStoreState returns `drawer`'s entire state.  So if `drawer` also a had a `rando` attr, you could grab that while you're at it:

```javascript
const {open, rando} = store.useStore('drawer', ['open']);
```
or just the entire state object:
```javascript
const drawerState = store.useStore('drawer', ['open']);
```

## getHelpers

`getHelpers` gives you `setState` & `getState` & `useStore` scoped to a particular store.

```javascript
import {store} from './constants';

const close = () => {
  setState({open: false})
};

// getState() returns drawer's state
// useStore is scoped to `drawer` and will observe changes to `open`
const {getState, setState, useStore} = store.getHelpers('drawer', ['open'])

function Drawer() {
  const {open} = useStore();

  return (
    <MuiDrawer open={open}>
      <div onClick={close}>close drawer</div>
    </MuiDrawer>
  )
}

export default React.memo(Drawer);
```

## getState

You can access a store's state via `getState(store)`:

```javascript
store.getState('drawer');
```

## Watching for changes to any attribute in a store

If you'd like to watch for changes to _any_ attr in a store, simply remove the `watchAttrs` parameter:

```javascript
const {useStore} = store.getHelpers('drawer');

function Drawer() {
  // will trigger a rerender upon any change to the drawer store
  const {open} = useStore();
  // ...
}
```

## getFullState

Get the central state object that holds all of the stores.

```javascript
const allStores = store.getFullState();
allStores.modal // {open: true, title: 'other'} 
```

## Shallow compare

SSiG performs a shallow comparison when setState is called.  [See here](src/store.ts#L45).

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

SSiG is written in TS, and it's highly recommended that you use it with TS.  

To do so, define your store's state like so:

``` TypeScript
export interface DrawerState {
  "open": boolean;
}

export interface ModalState {
  "open": boolean;
  "title": string;
}

export interface AppState {
  "drawer": DrawerState;
  "modal": ModalState;
}
```

Then pass in AppState as a Generic when creating your store:

```TypeScript
const store = new Store<AppState>(appState);
```

Now TS will be able to check that you're passing in the correct parameters into things like `useStore`, eg:

```TypeScript
// TS will warn that there's no "blah" attr in the drawer store
const drawerState = store.useStore('drawer', ['blah']);

// TS will warn that there's no "blah" store
const drawerState = store.useStore('blah');
```

## Motivation

SSiG was inspired by my abuse of [easy-peasy][2] while building a medium-sized React SPA.  I wasn't sure why I was supposed to create an `action` just to add an item to an array, when you can just do: 
```javascript 
setState({arr: [...arr, item]});
```

Replacing easy-peasy with SSiG in my app was quite easy ... and everything seems to Just Work.
## How does it work?

When `useStore` is called, a `forceUpdate` function is created and stored away (which is dereferenced upon component dismount, of course).

When `setState` is called, it finds all of the changed attributes for that store, then finds the components watching those attrs, then `forceUpdate`s them.

## Prior art

[easy-peasy][2]

## Todo

* Tests
* chill

## License

MIT

[1]: https://github.com/CharlesStover/use-force-update
[2]: https://github.com/ctrlplusb/easy-peasy
