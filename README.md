# setStateIsGreat
<p align='center'>A global store, setState, and a hooks-based API.</p>

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

This is where things start to get a bit more complicated.  `useStoreState` requires that you pass in the _same_ object every time, so we define it outside of the function.

As you might guess, `watch_attrs` tells sSIG to only rerender this function if `drawer.open` changes.

However, even though it's only watching `open`, useStoreState returns `drawer`'s entire object.  EG, if `drawer` also a had a `rando` attr, you could grab that while you're at it:

```javascript
const {open, rando} = useStoreState(query);
```

## _Really_ global state

Since sSIG is designed to be a global store, it's expected that you can access it globally.

As a result, `createStore` accepts a second parameter - a global object.  Behold: 

```javascript
window.App = {};
createStore({
  main: {viewShown: 'Home'},
  drawer: {open: false, rando: '?'},
  home: {title: 'Home'}
}, window.App);

// sSIG will set the store on window.App.store
window.App.store.setState('drawer', {rando: 'what even is this thing?'});
```

sSIG takes some liberties and assigns the store to `window.App.store`

The advantage of this comes into effect with the `getHelpers` helper.

## getHelpers

You can only use this if you give the createStore a global object!

Since sSIG has a has a reference to your store, it can give you some syntact sugar helper functions.  So instead of doing this:

```javascript
import {useStoreState} from 'set-state-is-great';



const setState = 

const close = () => {
  setState({open: false})
};

const query = {
  store: 'drawer',
  watch_attrs: ['open']
};

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
