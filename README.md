# Set State is Great
<p align='center'>A global store, setState, and a hooks-based API.</p>

Global state management without the ceremony.  No Context, Redux, Actions, Thunks, Selectors, or anything that ends in "ducer." 

## Installing

```
npm install set-state-is-great
```
or
```
yarn add set-state-is-great
```

## Creating the store

Set State is Great (SSiG)'s data is organized by _stores_, which are objects that represent logical groupings of data (likely pertaining to a particular component). EG: 

```javascript
import {createStore} from 'set-state-is-great';

const store = createStore({
  main: {viewShown: 'Home'},
  drawer: {open: false},
  home: {title: 'Home'}
});
```

In this scenario, `main`, `drawer`, and `home` are your _stores_.

Since SSiG is designed to be a global store, feel free to attach `store` to a top-level object for global access, eg:

``` javascript
window.App = {store: store};
```

## setState

For mutating a store's data, there's `setState`:

```javascript
store.setState('drawer', {open: true});
```

## The `useStoreState` Hook
SSiG comes with only one hook (for now): `useStoreState`:
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

`watch_attrs: ['open']` tells SSiG to only rerender this function if `drawer.open` changes.

However, despite only watching `open`, useStoreState returns `drawer`'s entire state.  EG, if `drawer` also a had a `rando` attr, you could grab that while you're at it:

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
  // getState() used for demo purposes here ... dont look too deeply into it
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

With `getStateHelpers` this collapses down to:

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

You can access a store's state via `getState(store)`:

```javascript
store.getState('drawer');
```

## Watching for changes to any attribute in a store

If you'd like to watch for changes to _any_ attr in a store, simply remove `watch_attrs`:

```javascript
// will trigger a rerender upon any change to the drawer store
const {query, getState, setState} = getStateHelpers({
  store: 'drawer'
});
```

## Shallow compare

SSiG performs a shallow comparison when setState is called.  [See here](src/store.js#L31).

I've thought about pushing this another level deep, and allowing stuff like `"post.title"` in `watch_attrs` ... but I've yet to encounter a need for it.  Thoughts are welcome on this.

## forceUpdateViaName
You can give the query object a name:

```javascript
const query = {
  store: 'post',
  name: 'post_detail'
};
```

Which you enables you to forceUpdate this component from anywhere (if it's still mounted - if not, nothing bad happens).

```javascript
  window.App.store.forceUpdateViaName('post', 'post_detail');
```

I'm using it in my app, but it's kinda funky ... consider this an unstable api.

## Motivation

SSiG was inspired by my abuse of [easy-peasy][2] while building a medium-sized React SPA.  I wasn't sure why I was supposed to create an `action` just to add an item to an array, when you can just do: 
```javascript 
setState({arr: [...arr, item]});
```

Replacing easy-peasy with SSiG in my app was quite easy ... and everything seems to Just Work.
## How does it work?

When `useStoreState` is called, a `forceUpdate` function is created (using [use-force-update][1]) and stored away (which is dereferenced upon component dismount, of course).

When `setState` is called, it finds all of the changed attributes for that store, then finds the objects that have those attrs in `watch_attrs`, then calls the `forceUpdate`s associated with those objects.

So ultimately, SSiG merely maps objects to `forceUpdate`s, and it's just a matter of finding the relevant objects when `setState` is called.

## Prior art

[easy-peasy][2]

## Todo

* Tests
* TypeScript stuff - maybe rewrite it in TS?
* Make my own useForceUpdate hook?  Would make this lib zero-dependency.
* chill

[1]: https://github.com/CharlesStover/use-force-update
[2]: https://github.com/ctrlplusb/easy-peasy