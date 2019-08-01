# Set State is Great
<p align='center'>A global store + setState + hooks integration.</p>

Global state management without the ceremony.  No Context, Redux, actions, thunks, selectors, or anything that ends in "ducer." 

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
Watch a specific store's state with `useStoreState`:
```javascript
import {useStoreState} from 'set-state-is-great';

const query = {
  store: 'drawer',
  watchAttrs: ['open']
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

`watchAttrs: ['open']` tells SSiG to only rerender this function if `drawer.open` changes.

However, despite only watching `open`, useStoreState returns `drawer`'s entire state.  So if `drawer` also a had a `rando` attr, you could grab that while you're at it:

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
  watchAttrs: ['open']
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
  watchAttrs: ['open']
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

If you'd like to watch for changes to _any_ attr in a store, simply remove `watchAttrs`:

```javascript
// will trigger a rerender upon any change to the drawer store
const {query, getState, setState} = getStateHelpers({
  store: 'drawer'
});
```

## useDynamicStoreState
For dynamic store/attr watching there's `useDynamicStoreState`:

```javascript
import {useDynamicStoreState} from 'set-state-is-great';

function NumSelect({store}) {
  const {state: {val}, setState} = useDynamicStoreState({
    key: `num-select-${store}`,
    store: store,
    watchAttrs: ['val'],
    getStateHelpers: true
  });

  const onChange = e => {
    setState({val: e});
  };

  return (
    <select value={val} onChange={onChange}>
      <option value='one'>one</option>
      <option value='two'>two</option>
      <option value='three'>three</option>
    </select>
  )
};

export default React.memo(NumSelect);
```

`useDynamicStoreState` requires that you pass in a unique `key`, because we need a unique value to map the `forceUpdate` to.  `getStateHelpers` returns state, setState and getState.  If `getStateHelpers` is missing or falsey, it just returns `state` (so no need for a nested destructure like shown above).

## Shallow compare

SSiG performs a shallow comparison when setState is called.  [See here](src/store.js#L26).

## forceUpdateViaName
You can give the query object a name:

```javascript
const query = {
  store: 'post',
  name: 'post_detail'
};
```

Which you enables you to forceUpdate this component from anywhere (if it's still mounted - if not, it won't rerender it).

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

When `use(Dynamic)StoreState` is called, a `forceUpdate` function is created and stored away (which is dereferenced upon component dismount, of course).

When `setState` is called, it finds all of the changed attributes for that store, then finds the objects that have those attrs in `watchAttrs`, then calls the `forceUpdate`s associated with those objects.

So ultimately, SSiG merely maps objects to `forceUpdate`s, and it's just a matter of finding the relevant objects when `setState` is called.

## Prior art

[easy-peasy][2]

## Todo

* Tests
* TypeScript stuff - maybe rewrite it in TS?
* chill

## License

MIT

[1]: https://github.com/CharlesStover/use-force-update
[2]: https://github.com/ctrlplusb/easy-peasy
