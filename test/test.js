// node -r esm test/test.js
// https://stackoverflow.com/a/54090097
import {createStore} from '../src/index.js';

const store = createStore({
  one: {1: 1},
  two: {2: 2},
  three: {3: 3}
});

console.log(store);
