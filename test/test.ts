// ignore this file
import { Store } from '../src/index';

const appState = {
  viewShown: 'Home',
  colormode: 'dark',
  drawer: { open: false, other: '?' },
};

const store = new Store(appState);

console.log(store);
