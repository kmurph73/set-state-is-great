# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn b` — clean `dist/` and compile TypeScript (`rimraf dist && tsc`). This is the build/typecheck command; there is no separate typecheck script.
- `yarn lint` — run ESLint over `src/**/*.ts`.
- There is no test runner configured. `test/test.ts` is a scratch file (it self-documents as "ignore this file") and is not wired into CI or any script.

## Architecture

This is a published npm package (`set-state-is-great`) — a tiny React global-store library. The whole public surface lives in three files under `src/`:

- `src/store.ts` — the `Store<State>` class. Holds `state` and a `componentStore: Map<keyof State, Map<string, () => void>>` that maps each top-level state key to the set of subscribed components' `forceUpdate` callbacks. Mutation methods (`setState`, `setPartialState`, `setStateIfDifferent`, `forceUpdate`) all funnel through `forceUpdate(key)`, which iterates the component map for that key and calls each callback. `getHelpers(key)` returns key-scoped wrappers around the mutators.
- `src/useStoreState.ts` — the `useStoreState` and `useNonNullState` hooks. Each generates a stable id via `React.useId()`, registers a `forceUpdate` callback into `store.componentStore` under `(key, id)` in a `useEffect`, and unregisters on cleanup. The hook returns `store.state[key]` directly — re-renders are driven by the registered callback firing, not by React tracking the value.
- `src/useForceUpdateIfMounted.ts` — `useReducer`-based `forceUpdate` guarded by an `isMounted` ref so unmounted components don't re-render.

Key design invariants to preserve when editing:
- Subscriptions are **per top-level key**, not per nested path. A mutation to `state.drawer.open` notifies every component subscribed to `'drawer'`.
- `setPartialState` mutates the existing object in place via `Object.assign`. Passing in the same object reference throws — use `forceUpdate(key)` instead. Passing a key with no existing object also throws.
- `setState` and `setPartialState` always re-render every subscriber unconditionally; only `setStateIfDifferent` does a referential equality check.
- The hooks intentionally return `store.state[key]` *outside* React's render-tracking — correctness depends on the subscribe/forceUpdate path, so don't refactor toward `useSyncExternalStore` or memoization without understanding why.

## Package layout

`package.json` ships both `dist/` (compiled JS, `main`) and `src/` (sources, `types` points at `src/index.ts`). React 19 is a `peerDependency`. Bumping the React major in `peerDependencies` should be coordinated with hook usage (`useId` requires React 18+).
