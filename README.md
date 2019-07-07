# setStateIsGreat
<p align='center'>A global store & setState, with a hooks-based API.</p>

Global state management without the ceremony.  No Context, Redux, Thunks, Selectors, or anything that ends in "ducer." 

## Creating the store

setStateIsGreat (sSIG)'s data is organized by _stores_, which are objects that represent logical groupings of data (often pertaining to a particular component). EG: 

```javascript
import {createStore} from 'set-state-is-great';

const store = createStore({
  main: {viewShown: 'Home'},
  drawer: {open: false},
  home: {title: 'Home'}
});
```

In this scenario, `main`, `drawer`, and `home` are your _stores_.

Since sSIG is designed to be global, feel free to attach `store` to a global object for global access, eg:

``` javascript
window.App = {store: store};
```

## setState

For mutating a store's data, there's `setState`:

```javascript
store.setState('drawer', {open: true});
```

## The `useStoreState` Hook
sSIG comes with only one hook (for now): `useStoreState`:
```javascript
import {useStoreState} from 'set-state-is-great';

const query = {
  store: 'drawer',
  watch_attrs: ['open']
};

function Drawer() {
  const {open} = useStoreState(query);
  return (
    <MuiDrawer open={open}>
      <div>just drawer things</div>
    </MuiDrawer>
  )
}

export default React.memo(Drawer);
```

`useStoreState` requires that you pass in the _same_ object every time, so we define it outside of the function.

As you might guess, `watch_attrs: ['open']` tells sSIG to only rerender this function if `drawer.open` changes.

However, even though it's only watching `open`, useStoreState returns `drawer`'s entire state.  EG, if `drawer` also a had a `rando` attr, you could grab that while you're at it:

```javascript
const {open, rando} = useStoreState(query);
```
or just the entire state object:
```javascript
const drawerState = useStoreState(query);
```

## getStateHelpers

`getStateHelpers` gives you `setState` & `getState` for a particular store. So instead of doing this (assuming you've attached `store` to a global object):

```javascript
import {useStoreState} from 'set-state-is-great';

const setState = (state) => {
  window.App.store.setState('drawer', state);
};

const getState = () => {
  return window.App.store.getState('drawer');
};

const close = () => {
  setState({open: false})
};

const query = {
  store: 'drawer',
  watch_attrs: ['open']
};

function Drawer() {
  useStoreState(query);
  // getState() used for demo purposes only ... dont look too deeply into this
  const state = getState();

  return (
    <MuiDrawer open={state.open}>
      <div onClick={close}>close drawer</div>
      <div>rando? {state.rando}</div>
    </MuiDrawer>
  )
}

export default React.memo(Drawer);
```

With the magic of `getStateHelpers` you can do:

```javascript
import {useStoreState} from 'set-state-is-great';

const close = () => {
  setState({open: false})
};

const {query, getState, setState} = getStateHelpers({
  store: 'drawer',
  watch_attrs: ['open']
});

function Drawer() {
  useStoreState(query);
  const state = getState();

  return (
    <MuiDrawer open={state.open}>
      <div onClick={close}>close drawer</div>
      <div>rando? {state.rando}</div>
    </MuiDrawer>
  )
}

export default React.memo(Drawer);
```

`getStateHelpers` also spits back `query` (the same object you passed in) for you to to destructure and pass into `useStoreState`

## getState

As shown above, you can access a store's state via `getState`:

```javascript 
store.getState('drawer')
```

## Watching for changes to any attribute in a store

If you'd like to watch for changes to any attr in the store, simply remove `watch_attrs`:

```javascript
const {query, getState, setState} = getStateHelpers({
  store: 'drawer'
});
```